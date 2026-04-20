import slugify from "slugify";

export function makeSlug(name: string, fallback: string): string {
  return slugify(name, { lower: true, strict: true }) || fallback;
}

export async function allocateUniqueSlug(
  base: string,
  slugExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base;
  let n = 2;
  for (;;) {
    if (!(await slugExists(candidate))) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
    if (n > 10_000) throw new Error("Could not generate a unique slug");
  }
}
