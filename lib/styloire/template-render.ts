/** Replace {{field}} tokens with provided values (spec §6). */
export function renderTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    return vars[key] ?? `{{${key}}}`;
  });
}

/** Replace single-brace `{field}` tokens (stored subject templates). */
export function renderBracedFields(template: string, vars: Record<string, string>) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key: string) => {
    return vars[key] ?? `{${key}}`;
  });
}
