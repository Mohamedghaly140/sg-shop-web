export const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 30, 35, 40, 45, 50] as const;

export function parseOptionalString(val: FormDataEntryValue | null): string | null {
  const s = typeof val === "string" ? val.trim() : "";
  return s || null;
}
