/**
 * Grand Bandhan Indian Rupee and Luxury Date/Time Formatters
 */

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Not Scheduled';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return '--:--';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatRoleLabel(role: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Administrator';
    case 'AGENCY_ADMIN':
      return 'Agency Principal';
    case 'WEDDING_PLANNER':
      return 'Senior Wedding Planner';
    case 'COORDINATOR':
      return 'On-Ground Coordinator';
    case 'VENDOR':
      return 'Empaneled Vendor Partner';
    case 'CLIENT':
      return 'Royal Couple & Family';
    default:
      return role.replace(/_/g, ' ');
  }
}
