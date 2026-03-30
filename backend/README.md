# Backend Setup Guide

## Files to upload via FTP

Upload the 3 PHP files and config to your server:

```
/your-server-root/backend/
  ├── config.php
  ├── auth.php
  ├── bookings.php
  └── blocked_dates.php
```

Copy `api.ts` into your React project:
```
/your-react-project/src/api.ts
```

---

## 1. Database Setup (phpMyAdmin)

1. Open **phpMyAdmin**
2. Click **SQL** tab
3. Paste the contents of `database.sql` and click **Go**

This creates the `labbutibas_diena` database with 3 tables and inserts a default admin.

**Default admin credentials:**
- Username: `admin`
- Password: `admin123`

---

## 2. Edit config.php

Open `config.php` and update:

```php
define('DB_HOST', 'localhost');    // usually localhost
define('DB_NAME', 'labbutibas_diena');
define('DB_USER', 'root');         // your MySQL user
define('DB_PASS', '');             // your MySQL password
```

Also update the allowed origins if your React app runs on a different port:
```php
$allowed_origins = [
    'http://localhost:3000',   // Vite default
    'http://localhost:5173',   // also Vite
];
```

---

## 3. Update api.ts in React

Change the BASE_URL to match where you uploaded the PHP files:

```ts
// If files are at http://localhost/backend/
const BASE_URL = 'http://localhost/backend';

// If files are at http://192.168.1.10/booking-api/
const BASE_URL = 'http://192.168.1.10/booking-api';
```

---

## 4. Using the API in React

### Submit a booking (BookingPage.tsx)
```ts
import { api } from '../api';

const handleSubmit = async () => {
  try {
    await api.bookings.create({
      date: selectedDate.toISOString().split('T')[0],  // "2025-10-15"
      name: formData.name,
      email: formData.email,
      additionalInfo: formData.additionalInfo,
    });
    setShowConfirmation(true);
  } catch (err) {
    alert(err.message);
  }
};
```

### Load unavailable dates (BookingPage.tsx)
```ts
useEffect(() => {
  api.bookings.unavailable().then(res => {
    setUnavailableDates(res.unavailable.map(d => new Date(d)));
  });
}, []);
```

### Admin login (App.tsx)
```ts
const handleLogin = async (e) => {
  e.preventDefault();
  try {
    await api.auth.login(username, password);
    setIsAdminAuthenticated(true);
    setCurrentView('admin');
  } catch (err) {
    setLoginError('Incorrect credentials');
  }
};
```

### Admin: load & manage bookings (AdminPage.tsx)
```ts
// Load all bookings
const { bookings } = await api.bookings.list({ archived: '0' });

// Approve
await api.bookings.update(id, { status: 'approved' });

// Decline
await api.bookings.update(id, { status: 'declined' });

// Archive
await api.bookings.update(id, { is_archived: true });

// Delete permanently
await api.bookings.delete(id);
```

### Admin: block/unblock dates (AdminPage.tsx)
```ts
// Block
const date = selectedDate.toISOString().split('T')[0];
const { id } = await api.blockedDates.block(date);

// Unblock (you need to store the id from the list)
await api.blockedDates.unblock(blockedDateId);

// Load all blocked dates
const { blocked_dates } = await api.blockedDates.list();
```

---

## 5. API Reference

| File | Action | Method | Auth | Description |
|------|--------|--------|------|-------------|
| auth.php | login | POST | ❌ | Login admin |
| auth.php | logout | POST | ✅ | Logout |
| auth.php | check | GET | ❌ | Check session |
| bookings.php | create | POST | ❌ | Submit booking |
| bookings.php | unavailable | GET | ❌ | Get blocked+booked dates |
| bookings.php | list | GET | ✅ | List bookings (sortable) |
| bookings.php | update | PUT | ✅ | Update status/archive/edit |
| bookings.php | delete | DELETE | ✅ | Delete permanently |
| blocked_dates.php | list | GET | ✅ | List blocked dates |
| blocked_dates.php | block | POST | ✅ | Block a date |
| blocked_dates.php | unblock | DELETE | ✅ | Unblock a date |

### Sorting (bookings list)
```
?action=list&sort=booking_date&dir=ASC
?action=list&sort=name&dir=DESC
?action=list&sort=status&dir=ASC
?action=list&sort=submitted_at&dir=DESC
```

### Filtering
```
?action=list&status=pending
?action=list&archived=1          ← show archived
?action=list&from=2025-10-01&to=2025-10-31
```

---

## Grading Checklist (from your screenshot)

| Criterion | Implemented |
|-----------|-------------|
| ir vismaz 3 skati (3 views) | ✅ Booking, Admin, Archive |
| ir login | ✅ auth.php with session |
| strādā uz dažādas izšķirtspējas | ✅ (frontend handles this) |
| ir dinamisks saturs (animācijas) | ✅ (frontend handles this) |
| pievienot, dzēst un labot (6) | ✅ create / delete / update |
| ir admin profils | ✅ admins table + session |
| var šķirot lietas | ✅ sort param on list endpoint |
| ir arhīvs | ✅ is_archived flag + list filter |
| ER modelis | Create in sqldbm.com (3 tables) |
| ir vismaz 3 tabulas | ✅ admins, bookings, blocked_dates |
| pareizie datubāzes iestatījumi | ✅ UTF8MB4, indexes, foreign keys |
