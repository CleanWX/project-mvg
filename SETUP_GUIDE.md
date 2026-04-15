# 🔧 Setup & Deployment Guide

This guide covers how to set up and deploy the Mental Health Day Booking System on your server.

## 📋 Prerequisites

Before you begin, make sure you have:

### Server Requirements
- **Web Server**: Apache or Nginx with PHP support
- **PHP Version**: 7.4 or higher
- **MySQL Version**: 5.7 or higher
- **FTP Access**: To upload files to your server
- **Shell/SSH Access**: For running commands (optional but recommended)

### Local Development (for setup)
- **Node.js**: Version 16 or higher (only needed to build frontend)
- **npm or yarn**: Package manager for Node.js
- **A text editor**: For editing config files

## 🗂️ Files to Upload

You need to upload the following files to your web server:

### Backend Files (Required)
Upload to your server's public directory (e.g., `/public_html/backend/`):
```
backend/
├── config.php
├── auth.php
├── bookings.php
└── blocked_dates.php
```

### Frontend Files (Required)
Upload the built frontend to your server's public directory (e.g., `/public_html/`):
```
The entire "build/" folder contents
```

> **Note**: You only upload the `build/` folder contents, not the source files.

## 🗄️ Step 1: Database Setup

### 1.1 Access phpMyAdmin
1. Log into your hosting control panel (cPanel, Plesk, etc.)
2. Find and open **phpMyAdmin**
3. Login with your MySQL credentials

### 1.2 Create Database and Tables
1. Copy the entire contents of `backend/database.sql`
2. In phpMyAdmin, click the **SQL** tab
3. Paste the SQL code
4. Click **Go** or **Execute**

This will create:
- Database: `labbutibas_diena`
- Tables: `users` (admins), `bookings`, `blocked_dates`
- Default admin user: `admin` / `admin123`

### 1.3 Verify Setup
- You should see a success message
- Check the left sidebar for the new database

## ⚙️ Step 2: Configure Backend

### 2.1 Edit config.php
1. Download `backend/config.php` from the repository
2. Edit the file with a text editor and update these values:

```php
// Database Connection
define('DB_HOST', 'localhost');        // Your database host
define('DB_NAME', 'labbutibas_diena'); // Database name
define('DB_USER', 'root');             // MySQL username
define('DB_PASS', '');                 // MySQL password

// CORS - Update these to match your domain
$allowed_origins = [
    'http://example.com',
    'https://example.com',
    'http://www.example.com',
    'https://www.example.com'
];
```

### 2.2 Find Your Database Credentials
Your hosting provider should have provided:
- Database host (usually `localhost`)
- Database name
- Database username
- Database password

> **Security Tip**: Use a strong password for your MySQL user, not `root` in production.

### 2.3 Upload config.php
1. Upload the edited `config.php` to `/backend/` on your server
2. **DO NOT** share this file publicly or commit it to version control

## 🏗️ Step 3: Build and Upload Frontend

### 3.1 Build the Frontend (on your computer)
1. Open terminal/command prompt
2. Navigate to the `frontend/` folder:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Build the project:
   ```bash
   npm run build
   ```

This creates a `build/` folder with optimized files.

### 3.2 Upload Built Files
1. Connect to your server via FTP
2. Navigate to your public root directory (usually `/public_html/`)
3. Upload all contents of the `build/` folder
4. Keep the directory structure (should have `assets/`, `index.html`, etc.)

### 3.3 Update API Endpoint (if needed)
If your backend is on a different domain or path, you need to update the API configuration:

1. Open `frontend/src/api.ts` on your computer
2. Find the API base URL
3. Update it to match your backend location:
   ```typescript
   const API_BASE = 'https://your-domain.com/backend';
   ```
4. Rebuild the frontend (`npm run build`)
5. Re-upload the `build/` contents

## 🧪 Step 4: Verify Installation

### 4.1 Test the Booking Page
1. Open your domain in a web browser: `https://your-domain.com`
2. You should see the booking calendar
3. Try selecting a date - it should load smoothly
4. Try submitting a test booking

### 4.2 Test the Admin Panel
1. Click the admin button or navigate to the admin section
2. You should see a login dialog
3. Login with:
   - Username: `admin`
   - Password: `admin123`

### 4.3 Check the Backend
Test that the API is working:
1. In your browser, visit: `https://your-domain.com/backend/bookings.php`
2. You may see a JSON response or message
3. This confirms the backend files are accessible

## 🔒 Security Checklist

Before going live, complete these security steps:

- [ ] **Change default admin password**
  - Login to admin panel with default credentials
  - Change password immediately
  
- [ ] **Update database credentials**
  - Use a strong, unique password
  - Don't use default `root` password
  
- [ ] **Enable HTTPS**
  - Get an SSL certificate (often free with hosting)
  - Update allowed origins in config.php to use HTTPS
  
- [ ] **Set file permissions**
  - Make `config.php` not writable: `chmod 444 config.php`
  - Make backend directory not executable for web users
  
- [ ] **Remove phpmyadmin** (if publicly accessible)
  - Or restrict access by IP/password
  
- [ ] **Regular backups**
  - Backup database regularly
  - Keep copies of config.php in a safe place

## 👤 Managing Admin Accounts

### Add a New Admin User
1. Login to your hosting phpMyAdmin
2. Go to the `labbutibas_diena` database → `users` table
3. Click **Insert** to add a new row
4. Fill in:
   - `username`: The admin username
   - `password`: **Run this in the SQL tab first to hash it:**
     ```sql
     SELECT MD5('your-password-here');
     ```
   - Copy the hashed result and paste it in the password field
5. Click **Go** to add the user

### Delete an Admin User
1. In phpMyAdmin, go to `users` table
2. Click the delete (X) icon next to the user
3. Confirm deletion

## 📧 Email Notifications (Optional)

Currently, the system shows booking confirmations in the UI. To add email confirmations:

1. Update `backend/bookings.php` to include `mail()` function calls
2. Configure mail settings in `config.php`
3. Test email to ensure it's working

(More detailed instructions in API_DOCUMENTATION.md)

## 🐛 Troubleshooting

### Problem: "Database connection failed"
**Solution:**
- Check that database credentials in config.php are correct
- Verify the MySQL server is running
- Check that the database `labbutibas_diena` exists

### Problem: "CORS error" or API calls are blocked
**Solution:**
- Update `$allowed_origins` in config.php to include your domain
- Make sure to include both `http://` and `https://` versions
- Include both with and without `www`

### Problem: Frontend shows blank page
**Solution:**
- Check that all `build/` files were uploaded
- Verify that you have write permissions in public directory
- Check browser console (F12) for error messages
- Ensure index.html is in the root directory

### Problem: Admin login doesn't work
**Solution:**
- Verify default credentials are exactly: `admin` / `admin123`
- Check that the `users` table exists in the database
- Try resetting by deleting and re-running database.sql

### Problem: Can't upload files via FTP
**Solution:**
- Double-check FTP credentials
- Make sure you're uploading to the correct directory
- Check that you have write permissions (ask hosting provider)
- Try using SFTP instead of FTP

## 🚀 Version Updates

When updating the application:

1. **Backup your database** (always!)
2. **Pull latest code** from your repository
3. **Re-run npm build** for frontend
4. **Upload new build/ contents** to server
5. **Check database.sql** for any schema changes
6. **Run new SQL** in phpMyAdmin if there are changes
7. **Test thoroughly** before telling users

## 📞 Support

For server-specific issues, contact your hosting provider. They can help with:
- PHP version
- MySQL access
- FTP credentials
- File permissions
- HTTPS setup

---

**Installation Complete!** 🎉

Your Mental Health Day Booking System should now be live. Remember to monitor it regularly and keep backups of your database.
