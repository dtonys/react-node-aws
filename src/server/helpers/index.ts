export function slug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD') // decompose accents (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9\s-]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/-+/g, '-'); // collapse multiple dashes
}
