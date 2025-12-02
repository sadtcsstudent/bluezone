export const isStrongPassword = (password: string) =>
  /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
