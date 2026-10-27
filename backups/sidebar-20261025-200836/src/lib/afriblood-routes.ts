/** Known backend paths. Check availability before wiring UI to an endpoint. */
export const afribloodRoutes = {
  login: '/auth/login', me: '/auth/me', donors: '/donors', donations: '/donations',
  inventory: '/inventory', hospitalRequests: '/hospital-requests',
  laboratoryTests: '/laboratory/tests', reservations: '/blood-reservations',
  notifications: '/notifications', traceability: '/blood-unit-events',
  forecasting: '/demand-forecasting', redistribution: '/redistribution',
  analytics: '/analytics', reports: '/reports',
} as const;