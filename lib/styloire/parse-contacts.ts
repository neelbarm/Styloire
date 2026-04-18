export type ParsedContact = {
  brand_name: string;
  email: string;
  /** From CSV column `first_name` — maps to template field `{{contact_name}}` */
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
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeRows(rows: RawRow[]): ParseContactsResult {
  const errors: string[] = [];
  const dedupedByEmail = new Map<string, ParsedContact>();

  rows.forEach((raw, index) => {
    const brand = raw.brand_name?.trim().toUpperCase();
    const email = raw.email?.trim().toLowerCase();
    const firstName = raw.first_name?.trim();

    if (!brand || !email || !firstName) {
      errors.push(`Row ${index + 2}: missing brand_name, email, or first_name.`);
      return;
    }
    if (!isValidEmail(email)) {
      errors.push(`Row ${index + 2}: invalid email "${email}".`);
      return;
    }
    if (!dedupedByEmail.has(email)) {
      dedupedByEmail.set(email, { brand_name: brand, email, contact_name: firstName });
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
  const [headerLine, ...lines] = normalizedCsv.split(/\r?\n/);
  const header = headerLine.split(",").map((column) => column.trim().toLowerCase());
  const brandIndex = header.indexOf("brand_name");
  const emailIndex = header.indexOf("email");
  const firstNameIndex = header.indexOf("first_name");
  if (brandIndex < 0 || emailIndex < 0 || firstNameIndex < 0) {
    return {
      groups: {},
      contacts: [],
      errors: ["Required headers: brand_name, email, first_name."]
    };
  }

  const rows: RawRow[] = lines.map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    return {
      brand_name: cells[brandIndex],
      email: cells[emailIndex],
      first_name: cells[firstNameIndex]
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
  const rows = utils.sheet_to_json<RawRow>(sheet, { raw: false, defval: "" });
  return normalizeRows(rows);
}
