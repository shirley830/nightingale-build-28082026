export type RedactionResult = { redactedText: string; counts: Record<string, number>; reviewRequired: boolean; pipelineVersion: string };
const patterns: Array<{ key: string; replacement: string; regex: RegExp }> = [
  { key: 'singapore_id', replacement: '[REDACTED_ID]', regex: /\b[STFGM]\d{7}[A-Z]\b/gi },
  { key: 'generic_id', replacement: '[REDACTED_ID]', regex: /\b(?:IC|NRIC|ID|passport)\s*(?:no\.?|number|#)?\s*[:=-]?\s*[A-Z0-9-]{6,20}\b/gi },
  { key: 'phone', replacement: '[REDACTED_PHONE]', regex: /(?<!\d)(?:\+?65[-\s]?)?[689]\d{3}[-\s]?\d{4}(?!\d)/g },
  { key: 'phone_label', replacement: 'Phone: [REDACTED_PHONE]', regex: /\b(?:phone|mobile|tel)\s*[:=-]\s*\+?[\d\s()-]{7,20}/gi },
  { key: 'name_label', replacement: 'Name: [REDACTED_NAME]', regex: /\b(?:patient\s+name|name)\s*[:=-]\s*[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){1,3}/gi },
  { key: 'honorific_name', replacement: '[REDACTED_NAME]', regex: /\b(?:Mr|Mrs|Ms|Mdm|Madam)\.?\s+[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,2}\b/g },
];
export function redactBeforeModel(text: string): RedactionResult { let redactedText = text; const counts: Record<string, number> = {}; for (const pattern of patterns) { let count = 0; redactedText = redactedText.replace(pattern.regex, () => { count += 1; return pattern.replacement; }); counts[pattern.key] = count; } const residualDigitRun = /\d{8,}/.test(redactedText); const possibleUnlabelledName = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(redactedText.replace(/REDACTED_[A-Z]+/g, '')); return { redactedText, counts, reviewRequired: residualDigitRun || possibleUnlabelledName, pipelineVersion: 'deterministic-v1.1' }; }
