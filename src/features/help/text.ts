/** Splits a step into plain text and [[UI label]] chips. */
export function splitStep(step: string): { text: string; chip: boolean }[] {
  return step
    .split(/(\[\[[^\]]+\]\])/g)
    .filter(Boolean)
    .map((part) => (part.startsWith("[[") ? { text: part.slice(2, -2), chip: true } : { text: part, chip: false }));
}
