const emergencyPatterns = [
  /\b(chest pain|chest pressure|crushing chest)\b/i,
  /\b(trouble breathing|difficulty breathing|shortness of breath|can't breathe|cannot breathe)\b/i,
  /\b(face drooping|one[- ]sided weakness|sudden weakness|slurred speech|stroke symptoms)\b/i,
  /\b(unconscious|passed out|loss of consciousness|seizure)\b/i,
  /\b(severe allergic reaction|anaphylaxis|throat closing)\b/i,
  /\b(overdose|poisoning|swallowed poison)\b/i,
  /\b(suicidal|kill myself|end my life|self[- ]harm)\b/i,
]

export function isEmergencyQuery(query) {
  return emergencyPatterns.some((pattern) => pattern.test(query))
}

export const emergencyResponse = {
  code: 'urgent_care',
  message: 'These symptoms may need urgent attention. Contact your local emergency number or go to the nearest emergency department now. Do not wait for online wellness guidance.',
}
