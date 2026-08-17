export const MIN_PASSWORD_LENGTH = 8;

// The hard rule enforced server-side — Server Actions are directly callable
// once deployed, so this can't just live in the client-side strength meter.
export function isPasswordValid(password: string) {
  return password.length >= MIN_PASSWORD_LENGTH && /\d/.test(password);
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Too short" | "Weak" | "Fair" | "Good" | "Strong";
};

// Feedback only, not a gate — a password can be "Weak" and still pass
// isPasswordValid. Each check below is independent so the score moves
// smoothly as the user types rather than jumping in large steps.
export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { score: 0, label: "Too short" };
  }

  let score = 0;
  if (password.length >= 12) score++;
  if (/\d/.test(password)) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const labels: PasswordStrength["label"][] = ["Weak", "Weak", "Fair", "Good", "Strong"];
  return { score: score as PasswordStrength["score"], label: labels[score] };
}
