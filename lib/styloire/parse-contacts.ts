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

const MAX_CONTACT_FILE_BYTES = 5 * 1024 * 1024;
const BRAND_HEADER_CANDIDATES = ["brand name", "brand_name"];
const EMAIL_HEADER_CANDIDATES = ["email", "email address", "email_address"];
const CONTACT_HEADER_CANDIDATES = [
  "first name",
  "first_name",
  "contact name",
  "contact_name",
  "pr contact name",
  "pr contact"
];

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

function normalizeRows(rows: RawRow[]): ParseContactsResult {
  const errors: string[] = [];
  const dedupedByBrandAndEmail = new Map<string, ParsedContact>();

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
      const dedupeKey = `${brand}::${email}`;
      if (!dedupedByBrandAndEmail.has(dedupeKey)) {
        dedupedByBrandAndEmail.set(dedupeKey, {
          brand_name: brand,
          email,
          contact_name: contactName
        });
      }
    }
  });

  const contacts = [...dedupedByBrandAndEmail.values()];
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
  const brandIndex = header.findIndex((value) => BRAND_HEADER_CANDIDATES.includes(value));
  const emailIndex = header.findIndex((value) => EMAIL_HEADER_CANDIDATES.includes(value));
  const contactIndex = header.findIndex((value) => CONTACT_HEADER_CANDIDATES.includes(value));

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
  if (file.size > MAX_CONTACT_FILE_BYTES) {
    return {
      groups: {},
      contacts: [],
      errors: ["File is too large. Upload a file smaller than 5 MB."]
    };
  }

  if (extension === "csv") {
    const text = await file.text();
    return parseBrandContactsCsvDetailed(text);
  }

  if (extension !== "xlsx" && extension !== "xls") {
    return {
      groups: {},
      contacts: [],
      errors: ["Unsupported file type. Upload a .csv, .xls, or .xlsx file."]
    };
  }

  const { read, utils } = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = read(buffer);
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return { groups: {}, contacts: [], errors: ["Workbook has no sheets."] };
  const sheet = workbook.Sheets[firstSheetName];
  const rows = utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    defval: ""
  });
  const [headerRow, ...dataRows] = rows;
  if (!headerRow?.length) {
    return { groups: {}, contacts: [], errors: ["Workbook is empty."] };
  }

  const header = headerRow.map((column) => normalizeHeader(String(column ?? "")));
  const brandIndex = header.findIndex((value) => BRAND_HEADER_CANDIDATES.includes(value));
  const emailIndex = header.findIndex((value) => EMAIL_HEADER_CANDIDATES.includes(value));
  const contactIndex = header.findIndex((value) => CONTACT_HEADER_CANDIDATES.includes(value));

  if (brandIndex < 0 || emailIndex < 0) {
    return {
      groups: {},
      contacts: [],
      errors: [
        "Required headers: Brand Name and Email Address. Optional header: PR Contact Name."
      ]
    };
  }

  return normalizeRows(
    dataRows.map((row) => ({
      brand_name: String(row[brandIndex] ?? "").trim(),
      email: String(row[emailIndex] ?? "").trim(),
      contact_name: contactIndex >= 0 ? String(row[contactIndex] ?? "").trim() : "",
      first_name: contactIndex >= 0 ? String(row[contactIndex] ?? "").trim() : ""
    }))
  );
}
