export type ParsedContact = {
  brand_name: string;
  email: string;
  /** From CSV column `first_name` — maps to template field `{{contact_name}}` */
  contact_name: string;
};

export type GroupedContacts = Record<string, ParsedContact[]>;

export function parseBrandContactsCsv(csvText: string): GroupedContacts {
  const normalizedCsv = csvText.replace(/^\uFEFF/, "");
  const rows = normalizedCsv
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 3 && cells.some((cell) => cell));

  if (rows.length < 2) return {};

  const [header, ...dataRows] = rows;
  const normalizedHeader = header.map((column) => column.toLowerCase());
  const brandIndex = normalizedHeader.indexOf("brand_name");
  const emailIndex = normalizedHeader.indexOf("email");
  const firstNameIndex = normalizedHeader.indexOf("first_name");

  if (brandIndex === -1 || emailIndex === -1 || firstNameIndex === -1) {
    return {};
  }

  return dataRows.reduce<GroupedContacts>((acc, row) => {
    const brand = row[brandIndex]?.toUpperCase();
    const email = row[emailIndex];
    const firstName = row[firstNameIndex];

    if (!brand || !email || !firstName) return acc;
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push({ brand_name: brand, email, contact_name: firstName });
    return acc;
  }, {});
}
