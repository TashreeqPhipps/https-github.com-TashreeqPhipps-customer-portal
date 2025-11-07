export const REGEX = {
  fullName: /^[A-Za-zÀ-ž' -]{2,100}$/, // names
  idNumber: /^[0-9]{13}$/,  // SA ID
  accountNumber: /^[0-9]{8,20}$/,  // 8-20 digits
  username: /^[A-Za-z0-9._-]{4,50}$/,
  // min 12 chars, at least one lower, upper, digit and special char
  password: /^(?=.{12,128}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/,
  amount: /^(?:\d{1,12})(?:\.\d{1,2})?$/,
  currency: /^[A-Z]{3}$/,
  swiftBic: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
};

export function validate(fieldName, value) {
  const rule = REGEX[fieldName];
  if (!rule) return { ok: true };
  const ok = rule.test(String(value).trim());
  return { ok, message: ok ? null : `Invalid ${fieldName}` };
}
