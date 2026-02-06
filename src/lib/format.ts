// Formatting utilities used across the application

/**
 * Formats a number as Brazilian Real currency (BRL).
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formats a date string to short Brazilian format (dd/mm/yyyy).
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR");
}

/**
 * Formats a date string to Brazilian format with time (dd/mm/yyyy HH:mm).
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Returns a greeting based on the current hour of the day.
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}
