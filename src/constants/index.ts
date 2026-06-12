export const PRIORITY_META = {
  HIGH: { label: 'HIGH', wrapper: 'text-red-700 bg-red-50/60 border-red-100', dot: 'bg-red-500' },
  MEDIUM: { label: 'MEDIUM', wrapper: 'text-amber-700 bg-amber-50/60 border-amber-100', dot: 'bg-amber-500' },
  LOW: { label: 'LOW', wrapper: 'text-emerald-700 bg-emerald-50/60 border-emerald-100', dot: 'bg-emerald-500' }
} as const;

export const MONTH_NAMES_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Agu', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;