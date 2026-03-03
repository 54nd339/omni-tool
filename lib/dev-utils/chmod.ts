export const ROLES = ['Owner', 'Group', 'Other'] as const;
export const PERMS = ['Read', 'Write', 'Execute'] as const;
export const PERM_CHARS = ['r', 'w', 'x'] as const;

export const PRESETS = [
  { label: '755', desc: 'rwxr-xr-x (standard directory)' },
  { label: '644', desc: 'rw-r--r-- (standard file)' },
  { label: '777', desc: 'rwxrwxrwx (full access)' },
  { label: '600', desc: 'rw------- (owner only)' },
  { label: '700', desc: 'rwx------ (owner execute)' },
  { label: '664', desc: 'rw-rw-r-- (group write)' },
  { label: '750', desc: 'rwxr-x--- (group read/exec)' },
  { label: '440', desc: 'r--r----- (read only)' },
] as const;

export type PermGrid = [
  [boolean, boolean, boolean],
  [boolean, boolean, boolean],
  [boolean, boolean, boolean],
];

export function octalToGrid(octal: string): PermGrid {
  const digits = octal.padStart(3, '0').split('').map(Number);
  return digits.map((digit) => [Boolean(digit & 4), Boolean(digit & 2), Boolean(digit & 1)]) as PermGrid;
}

export function gridToOctal(grid: PermGrid): string {
  return grid.map(([read, write, execute]) => (read ? 4 : 0) + (write ? 2 : 0) + (execute ? 1 : 0)).join('');
}

export function gridToSymbolic(grid: PermGrid): string {
  return grid
    .map(([read, write, execute]) => (read ? 'r' : '-') + (write ? 'w' : '-') + (execute ? 'x' : '-'))
    .join('');
}