export function generateReferralCode(username: string): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const prefix = username.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
  return `${prefix}${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
