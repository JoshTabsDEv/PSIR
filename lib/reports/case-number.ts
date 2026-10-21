/**
 * Officers often type "Crim. Case No. 12345" into the criminal case field.
 * Templates already print the "Crim. Case No.:" label, so strip any such prefix.
 */
export function bareCaseNumber(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/^(?:crim(?:inal)?\.?\s*)?case\s*(?:no\.?|number|#)?\s*[:.\-]?\s*/i, '')
    .trim();
}
