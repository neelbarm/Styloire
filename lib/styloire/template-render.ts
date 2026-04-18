/** Replace {{field}} tokens with provided values (spec §6). */
export function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    return vars[key] ?? `{{${key}}}`;
  });
}
