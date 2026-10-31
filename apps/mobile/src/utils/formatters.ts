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

export function formatINRCompact(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return formatINR(amount);
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

export function getCountdown(targetDate: string | Date | null | undefined): {
  days: number;
  hours: number;
  mins: number;
  isPast: boolean;
} {
  if (!targetDate) {
    return { days: 0, hours: 0, mins: 0, isPast: false };
  }
  const target = new Date(targetDate).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, mins: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, mins, isPast: false };
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
