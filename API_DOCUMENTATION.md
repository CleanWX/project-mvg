# 📡 API Documentation

Technical reference for developers integrating with or extending the Mental Health Day Booking System API.

## 🌐 API Overview

The backend API is built with PHP and provides RESTful endpoints for:
- Authentication (admin login/logout)
- Booking management
- Blocked date management

### Base URL
```
https://your-domain.com/backend/
```

### Response Format
All responses are in JSON format.

### CORS Headers
The API includes CORS headers configured in `config.php`. Update `$allowed_origins` to allow requests from your frontend domain.

---

## 🔐 Authentication Endpoints

### Check Authentication Status
**GET** `/auth.php`

Check if the current user is authenticated.

**Response (Authenticated):**
```json
{
  "authenticated": true
}
```

**Response (Not Authenticated):**
```json
{
  "authenticated": false
}
```

**Status Codes:**
- `200 OK` - Request successful

---

### Login
**POST** `/auth.php`

Authenticate an admin user.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**Status Codes:**
- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials

**Notes:**
- Creates a session cookie for authentication
- Session persists across requests
- Include credentials flag in fetch requests: `credentials: 'include'`

---

### Logout
**POST** `/auth.php?action=logout`

End the current admin session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Status Codes:**
- `200 OK` - Logout successful

---

## 📅 Bookings Endpoints

### Get All Bookings
**GET** `/bookings.php`

Retrieve all bookings. **Requires admin authentication.**

**Response:**
```json
{
  "bookings": [
    {
      "id": 1,
      "date": "2024-05-15",
      "name": "John Doe",
      "email": "john@example.com",
      "additionalInfo": "Doctor appointment",
      "created_at": "2024-05-10 10:30:00"
    },
    {
      "id": 2,
      "date": "2024-05-16",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "additionalInfo": "",
      "created_at": "2024-05-11 14:20:00"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved bookings
- `403 Forbidden` - Not authenticated as admin

**Notes:**
- Only accessible to authenticated admins
- Returns bookings sorted by date
- Empty array if no bookings exist

---

### Create Booking
**POST** `/bookings.php`

Create a new booking.

**Request Body:**
```json
{
  "date": "2024-05-20",
  "name": "John Doe",
  "email": "john@example.com",
  "additionalInfo": "Optional note about the booking"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "id": 3,
  "booking": {
    "id": 3,
    "date": "2024-05-20",
    "name": "John Doe",
    "email": "john@example.com",
    "additionalInfo": "Optional note about the booking",
    "created_at": "2024-05-12 09:15:00"
  }
}
```

**Response (Failure - Date Already Booked):**
```json
{
  "success": false,
  "message": "This date is already booked"
}
```

**Response (Failure - Missing Fields):**
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**Status Codes:**
- `201 Created` - Booking created successfully
- `400 Bad Request` - Invalid input or missing fields
- `409 Conflict` - Date already booked or blocked

**Validation Rules:**
- `date` - Must be in YYYY-MM-DD format and in the future
- `name` - Required, non-empty string
- `email` - Required, valid email format
- `additionalInfo` - Optional, can be empty string

**Notes:**
- Email notifications can be added by implementing mail() function
- Dates are checked against bookings and blocked_dates
- No authentication required for public booking

---

### Get Unavailable Dates
**GET** `/bookings.php?action=unavailable`

Get list of dates that cannot be booked.

**Response:**
```json
{
  "unavailable": [
    "2024-05-15",
    "2024-05-16",
    "2024-05-20",
    "2024-05-21"
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved unavailable dates

**Notes:**
- Includes both booked dates AND blocked dates
- Used by frontend to disable dates on calendar
- Called on app load and after each new booking

---

### Delete Booking
**DELETE** `/bookings.php`

Delete a booking. **Requires admin authentication.**

**Request Body:**
```json
{
  "id": 3
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

**Response (Failure - Not Found):**
```json
{
  "success": false,
  "message": "Booking not found"
}
```

**Status Codes:**
- `200 OK` - Booking deleted successfully
- `403 Forbidden` - Not authenticated as admin
- `404 Not Found` - Booking ID not found

**Notes:**
- Only accessible to authenticated admins
- Cannot delete past bookings by default
- Requires booking ID

---

### Update Booking
**PUT** `/bookings.php`

Update an existing booking. **Requires admin authentication.**

**Request Body:**
```json
{
  "id": 3,
  "date": "2024-05-22",
  "name": "John Doe Updated",
  "email": "john.new@example.com",
  "additionalInfo": "Updated note"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Booking updated successfully",
  "booking": {
    "id": 3,
    "date": "2024-05-22",
    "name": "John Doe Updated",
    "email": "john.new@example.com",
    "additionalInfo": "Updated note",
    "created_at": "2024-05-12 09:15:00"
  }
}
```

**Status Codes:**
- `200 OK` - Booking updated successfully
- `400 Bad Request` - Invalid input
- `403 Forbidden` - Not authenticated as admin
- `404 Not Found` - Booking ID not found

**Notes:**
- Only accessible to authenticated admins
- Can update any field
- New date is validated against other bookings and blocks

---

## 🚫 Blocked Dates Endpoints

### Get All Blocked Dates
**GET** `/blocked_dates.php`

Retrieve all blocked/unavailable dates. **Requires admin authentication.**

**Response:**
```json
{
  "blocked_dates": [
    {
      "id": 1,
      "date": "2024-06-01",
      "reason": "School Holiday",
      "created_at": "2024-05-01 10:00:00"
    },
    {
      "id": 2,
      "date": "2024-06-02",
      "reason": "School Holiday",
      "created_at": "2024-05-01 10:00:00"
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Successfully retrieved blocked dates
- `403 Forbidden` - Not authenticated as admin

---

### Add Blocked Date
**POST** `/blocked_dates.php`

Block a date from being bookable. **Requires admin authentication.**

**Request Body:**
```json
{
  "date": "2024-06-15",
  "reason": "School Holiday"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Date blocked successfully",
  "id": 3,
  "blocked_date": {
    "id": 3,
    "date": "2024-06-15",
    "reason": "School Holiday",
    "created_at": "2024-05-12 14:30:00"
  }
}
```

**Status Codes:**
- `201 Created` - Date blocked successfully
- `400 Bad Request` - Invalid input
- `403 Forbidden` - Not authenticated as admin

**Validation Rules:**
- `date` - Required, YYYY-MM-DD format
- `reason` - Optional, descriptive text

---

### Delete Blocked Date
**DELETE** `/blocked_dates.php`

Remove a blocked date. **Requires admin authentication.**

**Request Body:**
```json
{
  "id": 3
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Blocked date deleted successfully"
}
```

**Status Codes:**
- `200 OK` - Blocked date deleted successfully
- `403 Forbidden` - Not authenticated as admin
- `404 Not Found` - Blocked date ID not found

---

## 🛡️ Error Handling

All errors follow this format:

```json
{
  "error": "Error description",
  "success": false
}
```

### Common HTTP Status Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid input, missing fields, malformed JSON |
| `401` | Unauthorized | Invalid credentials |
| `403` | Forbidden | Not authenticated or insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Date already booked or duplicate |
| `500` | Server Error | Database error or server issue |

---

## 🔄 Frontend Integration

### Example API Calls

**TypeScript/JavaScript with fetch:**

```typescript
// Login
const loginResponse = await fetch('/backend/auth.php', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

// Get unavailable dates
const datesResponse = await fetch('/backend/bookings.php?action=unavailable');
const data = await datesResponse.json();

// Create booking
const bookingResponse = await fetch('/backend/bookings.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    date: '2024-05-20',
    name: 'John Doe',
    email: 'john@example.com',
    additionalInfo: 'Optional note'
  })
});
```

---

## 📊 Database Schema

### users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Unique user identifier
- `username` - Login username (must be unique)
- `password` - MD5 hashed password
- `created_at` - Account creation timestamp

---

### bookings Table
```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  additionalInfo TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Unique booking identifier
- `date` - Booked date (YYYY-MM-DD)
- `name` - Student name
- `email` - Student email
- `additionalInfo` - Additional notes/information
- `created_at` - Booking creation timestamp

---

### blocked_dates Table
```sql
CREATE TABLE blocked_dates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL UNIQUE,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - Unique blocked date identifier
- `date` - Blocked date (YYYY-MM-DD)
- `reason` - Why the date is blocked (e.g., "School Holiday")
- `created_at` - Block creation timestamp

---

## 🔒 Security Notes

1. **Password Hashing**: Passwords are hashed with MD5 (upgrade to bcrypt or password_hash in production)
2. **CORS**: Configure allowed origins in config.php
3. **SQL Injection**: All queries use parameterized statements (prepared statements)
4. **Sessions**: Uses PHP sessions with secure cookies
5. **HTTPS**: Always use HTTPS in production

---

## 📝 Rate Limiting

Currently no rate limiting is implemented. For production:
- Consider implementing rate limiting for booking creation
- Implement CAPTCHA for public booking endpoint
- Add logging for API access

---

## 🔄 Extending the API

### Add Email Notifications

In `bookings.php`, after successful booking creation:

```php
// Send confirmation email
$to = $booking['email'];
$subject = "Booking Confirmation - Mental Health Day";
$message = "Your booking for {$booking['date']} has been confirmed.";
mail($to, $subject, $message);
```

### Add Date Range Queries

Add a query parameter to get bookings in a date range:

```
GET /bookings.php?start_date=2024-05-01&end_date=2024-05-31
```

### Add User Profiles

Create a separate user bookings endpoint:

```
GET /user_bookings.php?email=user@example.com&token=verification_token
```

---

## 📞 Debugging

### Enable PHP Error Logging

Add to config.php:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php-errors.log');
```

### Check CORS Issues

In browser DevTools Console, look for:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Update `$allowed_origins` in config.php

### Test Endpoints with cURL

```bash
# Test booking endpoint
curl -X GET https://your-domain.com/backend/bookings.php?action=unavailable

# Test login
curl -X POST https://your-domain.com/backend/auth.php \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

**API Version:** 1.0.0  
**Last Updated:** April 2026
