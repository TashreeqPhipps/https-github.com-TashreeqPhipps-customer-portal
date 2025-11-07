export const patterns = {
    //letters, spaces, hyphen, apostrophe. 2-100 chars
  fullName: /^[A-Za-zÀ-ÖØ-öø-ÿ'’-]{1,40}(?:[ A-Za-zÀ-ÖØ-öø-ÿ'’-]{1,60})?$/u,

  //13 digits
  idNumber: /^\d{13}$/,

  //digits only, 6-20 digits
  accountNumber: /^\d{6,20}$/,

  //min 12 chars, at least one upper, one lower, one number, one special
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{12,128}$/,
};

export function validateField(name, value) {
  const rule = REGEX[name];
  if (!rule) return { ok: true };
  const ok = rule.test(value);
  return { ok, message: ok ? null : `Invalid ${name}` };
}