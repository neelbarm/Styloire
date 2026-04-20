export type ParsedContact = {
  brand_name: string;
  email: string;
  /** Optional PR contact name — maps to template field `{{contact_name}}` */
  contact_name: string;
};

export type GroupedContacts = Record<string, ParsedContact[]>;
export type ParseContactsResult = {
  groups: GroupedContacts;
  contacts: ParsedContact[];
  errors: string[];
};

type RawRow = {
  brand_name?: string;
  email?: string;
  first_name?: string;
  contact_name?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i += 1) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      currentRow.push(currentCell);
      if (currentRow.some((cell) => cell.trim() !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  if (currentRow.some((cell) => cell.trim() !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

function splitEmails(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function readFirstPresent(raw: Record<string, unknown>, keys: string[]): string {
  const normalized = new Map<string, string>();
  for (const [key, value] of Object.entries(raw)) {
    normalized.set(normalizeHeader(key), String(value ?? ""));
  }
  for (const key of keys) {
    const match = normalized.get(normalizeHeader(key));
    if (match !== undefined) return match;
  }
  return "";
}

function normalizeRows(rows: RawRow[]): ParseContactsResult {
  const errors: string[] = [];
  const dedupedByEmail = new Map<string, ParsedContact>();

  rows.forEach((raw, index) => {
    const brand = raw.brand_name?.trim().toUpperCase();
    const emails = splitEmails(raw.email ?? "");
    const contactName = (raw.contact_name ?? raw.first_name ?? "").trim();

    if (!brand || emails.length === 0) {
      errors.push(`Row ${index + 2}: missing brand name or email address.`);
      return;
    }

    for (const email of emails) {
      if (!isValidEmail(email)) {
        errors.push(`Row ${index + 2}: invalid email "${email}".`);
        continue;
      }
      if (!dedupedByEmail.has(email)) {
        dedupedByEmail.set(email, { brand_name: brand, email, contact_name: contactName });
      }
    }
  });

  const contacts = [...dedupedByEmail.values()];
  const groups = contacts.reduce<GroupedContacts>((acc, contact) => {
    if (!acc[contact.brand_name]) acc[contact.brand_name] = [];
    acc[contact.brand_name].push(contact);
    return acc;
  }, {});

  return { groups, contacts, errors };
}

export function parseBrandContactsCsv(csvText: string): GroupedContacts {
  return parseBrandContactsCsvDetailed(csvText).groups;
}

export function parseBrandContactsCsvDetailed(csvText: string): ParseContactsResult {
  const normalizedCsv = csvText.replace(/^\uFEFF/, "").trim();
  if (!normalizedCsv) return { groups: {}, contacts: [], errors: ["File is empty."] };
  const [headerRow, ...lines] = parseCsvRows(normalizedCsv);
  if (!headerRow) return { groups: {}, contacts: [], errors: ["File is empty."] };

  const header = headerRow.map((column) => normalizeHeader(column));
  const brandIndex = header.findIndex((value) => value === "brand name");
  const emailIndex = header.findIndex((value) => value === "email" || value === "email address");
  const contactIndex = header.findIndex((value) =>
    [
      "first name",
      "first_name",
      "contact name",
      "contact_name",
      "pr contact name",
      "pr contact"
    ].includes(value)
  );

  if (brandIndex < 0 || emailIndex < 0) {
    return {
      groups: {},
      contacts: [],
      errors: [
        "Required headers: Brand Name and Email Address. Optional header: PR Contact Name."
      ]
    };
  }

  const rows: RawRow[] = lines.map((line) => {
    return {
      brand_name: line[brandIndex]?.trim(),
      email: line[emailIndex]?.trim(),
      contact_name: contactIndex >= 0 ? line[contactIndex]?.trim() : "",
      first_name: contactIndex >= 0 ? line[contactIndex]?.trim() : ""
    };
  });
  return normalizeRows(rows);
}

export async function parseBrandContactsFile(file: File): Promise<GroupedContacts> {
  return (await parseBrandContactsFileDetailed(file)).groups;
}

export async function parseBrandContactsFileDetailed(file: File): Promise<ParseContactsResult> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") {
    const text = await file.text();
    return parseBrandContactsCsvDetailed(text);
  }

  if (extension !== "xlsx") {
    return {
      groups: {},
      contacts: [],
      errors: ["Unsupported file type. Upload a .csv or .xlsx file."]
    };
  }

  const { read, utils } = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer);
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { groups: {}, contacts: [], errors: ["Workbook has no sheets."] };
  const sheet = workbook.Sheets[firstSheetName];
  const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, { raw: false, defval: "" });
  return normalizeRows(
    rows.map((row) => ({
      brand_name: readFirstPresent(row, ["brand_name", "Brand Name"]),
      email: readFirstPresent(row, ["email", "Email Address"]),
      contact_name: readFirstPresent(row, ["contact_name", "PR Contact Name", "first_name"]),
      first_name: readFirstPresent(row, ["first_name", "PR Contact Name", "contact_name"])
    }))
  );
}
