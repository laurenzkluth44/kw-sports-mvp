/** Password rules shown live while typing. Keep MIN_PASSWORD_LENGTH in sync with Supabase Auth settings. */
export const MIN_PASSWORD_LENGTH = 10;

export type PasswordCheck = "length" | "letter" | "number" | "match";

export function passwordChecks(password: string, confirmation: string): Record<PasswordCheck, boolean> {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    letter: /\p{L}/u.test(password),
    number: /\d/.test(password),
    match: password.length > 0 && password === confirmation
  };
}

export function isAcceptablePassword(password: string, confirmation: string) {
  return Object.values(passwordChecks(password, confirmation)).every(Boolean);
}
