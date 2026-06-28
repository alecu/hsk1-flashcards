export function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeAnswer(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/（.*?）/g, "")
    .replace(/[¿?¡!.,;:()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeWord(value: string) {
  return value.replace(/（.*?）/g, "").trim();
}
