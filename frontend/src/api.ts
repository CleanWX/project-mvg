// =============================================
// src/api.ts  —  Frontend ↔ PHP backend bridge
//
// Change BASE_URL to match your local server.
// If PHP files are in C:\xampp\htdocs\backend\
// then BASE_URL = 'http://localhost/backend'
// =============================================

const BASE_URL = 'http://77.37.34.2/gp/backend';

// ---- helpers ----
async function req<T>(
  file: string,
  action: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: object,
  extra?: Record<string, string>,
): Promise<T> {
  const params = new URLSearchParams({ action, ...extra });
  const url    = `${BASE_URL}/${file}?${params}`;
  const res    = await fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

// =============================================
// AUTH
// =============================================
export const api = {
  auth: {
    login: (username: string, password: string) =>
      req<{ success: boolean; username: string }>(
        'auth.php', 'login', 'POST', { username, password }
      ),
    logout: () =>
      req<{ success: boolean }>('auth.php', 'logout', 'POST'),
    check: () =>
      req<{ authenticated: boolean; username?: string }>('auth.php', 'check'),
  },

  // =============================================
  // BOOKINGS
  // =============================================
  bookings: {
    /** Public: submit a new booking request */
    create: (payload: {
      date: string;        // "YYYY-MM-DD"
      name: string;
      email: string;
      additionalInfo?: string;
    }) => req<{ success: boolean; id: number }>('bookings.php', 'create', 'POST', payload),

    /** Public: get all unavailable dates for the calendar */
    unavailable: () =>
      req<{ unavailable: string[] }>('bookings.php', 'unavailable'),

    /** Admin: list bookings with optional filters */
    list: (params?: {
      status?: 'pending' | 'approved' | 'declined';
      archived?: '0' | '1';
      sort?: string;
      dir?: 'ASC' | 'DESC';
      from?: string;
      to?: string;
    }) => req<{ bookings: Booking[] }>(
      'bookings.php',
      'list',
      'GET',
      undefined,
      params as Record<string, string> | undefined,
    ),

    /** Admin: approve / decline / archive / edit */
    update: (id: number, payload: Partial<{
      status: 'pending' | 'approved' | 'declined';
      is_archived: boolean;
      name: string;
      email: string;
      additional_info: string;
      booking_date: string;
    }>) => req<{ success: boolean }>(
      'bookings.php', 'update', 'PUT', payload, { id: String(id) }
    ),

    /** Admin: permanently delete */
    delete: (id: number) =>
      req<{ success: boolean }>(
        'bookings.php', 'delete', 'DELETE', undefined, { id: String(id) }
      ),
  },

  // =============================================
  // BLOCKED DATES
  // =============================================
  blockedDates: {
    list: () =>
      req<{ blocked_dates: BlockedDate[] }>('blocked_dates.php', 'list'),

    block: (date: string, reason?: string) =>
      req<{ success: boolean; id: number }>(
        'blocked_dates.php', 'block', 'POST', { date, reason }
      ),

    unblock: (id: number) =>
      req<{ success: boolean }>(
        'blocked_dates.php', 'unblock', 'DELETE', undefined, { id: String(id) }
      ),
  },
};

// =============================================
// TypeScript types
// =============================================
export interface Booking {
  id: number;
  booking_date: string;   // "YYYY-MM-DD"
  name: string;
  email: string;
  additional_info: string;
  status: 'pending' | 'approved' | 'declined';
  is_archived: boolean;
  submitted_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: number;
  blocked_date: string;   // "YYYY-MM-DD"
  reason: string | null;
  created_at: string;
}
