export function isKebabCase(value: string): boolean {
  return /^[a-z][a-z0-9-]*[a-z0-9]$/.test(value);
}

export function toKebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isValidScope(value: string): boolean {
  return /^@[a-z][a-z0-9-]*$/.test(value);
}

export function validateProjectName(value: string): true | string {
  const kebab = toKebabCase(value);
  if (!kebab) return 'Project name cannot be empty.';
  if (kebab.length < 2) return 'Project name must be at least 2 characters.';
  if (kebab.length > 64) return 'Project name must be under 64 characters.';
  return true;
}

export function validateScope(value: string): true | string {
  if (!value) return 'Scope cannot be empty.';
  if (!isValidScope(value)) return 'Scope must be in format @your-name (lowercase, letters, numbers, hyphens).';
  return true;
}
