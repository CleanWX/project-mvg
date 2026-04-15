# Mental Health Day Booking System

A simple, user-friendly web application that allows students to book a day off from school for mental health and well-being. The system features an easy-to-use booking interface and an admin panel for managing bookings and unavailable dates.

## 🎯 What is This?

This is a mental health day booking system designed for students. It provides:

- **Easy Booking**: Simple calendar-based interface to book your mental health day
- **Admin Panel**: Administrators can manage bookings and set blocked dates
- **Automated Management**: System prevents double-bookings and manages scheduling automatically

## ✨ Features

### For Students
- 📅 **Calendar-based booking** - Easily select your preferred date
- 🔍 **See available dates** - Unavailable dates are clearly marked
- ✉️ **Email confirmation** - Receive confirmation of your booking
- 📝 **Add notes** - Include additional information with your booking

### For Administrators
- 🔐 **Secure login** - Protected admin panel
- 📊 **View all bookings** - See all student bookings at a glance
- 🚫 **Block dates** - Mark dates as unavailable (holidays, events, etc.)
- ✏️ **Manage bookings** - Edit or delete bookings as needed
- 📈 **Booking statistics** - Track usage and patterns

## 🚀 Quick Start

### For Users
1. Visit the application
2. Select your preferred date from the calendar
3. Fill in your name and email
4. (Optional) Add a note about why you need the day
5. Submit your booking

### For Setup & Deployment
See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

## 📚 Documentation

- **[USER GUIDE](./USER_GUIDE.md)** - Complete guide for students on how to use the system
- **[SETUP GUIDE](./SETUP_GUIDE.md)** - Installation and deployment instructions for administrators
- **[API DOCUMENTATION](./API_DOCUMENTATION.md)** - Technical documentation for developers

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Backend**: PHP (RESTful API)
- **Database**: MySQL
- **UI Components**: Radix UI + Shadcn UI
- **Styling**: Tailwind CSS

## 📋 System Requirements

### For Deployment
- PHP 7.4+
- MySQL 5.7+
- Web server (Apache, Nginx, etc.)
- Node.js 16+ (for building the frontend)

### For Users
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

## 🔒 Privacy & Security

- All student data is stored securely on the server
- Admin panel is protected with username/password authentication
- Personal information is only used for booking management
- No data is shared with third parties

## 📞 Support

If you encounter any issues:

1. Check the [USER GUIDE](./USER_GUIDE.md) for common questions
2. Contact your school administrator

## 📝 License

This project is for educational use. Please check with your institution for any licensing requirements.

## 📋 Project Structure

```
project-mvg/
├── backend/
│   ├── auth.php                 # Authentication logic
│   ├── bookings.php             # Booking management API
│   ├── blocked_dates.php        # Block date management
│   ├── config.php               # Database configuration
│   ├── database.sql             # Database schema
│   └── README.md                # Backend-specific setup
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main app component
│   │   ├── api.ts               # API client
│   │   ├── components/
│   │   │   ├── BookingPage.tsx  # Booking user interface
│   │   │   ├── AdminPage.tsx    # Admin panel
│   │   │   └── ui/              # Reusable UI components
│   │   └── styles/              # CSS styling
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.ts           # Vite configuration
│   └── index.html               # HTML entry point
│
├── USER_GUIDE.md                # Guide for students
├── SETUP_GUIDE.md               # Setup & deployment guide
├── API_DOCUMENTATION.md         # API reference
└── README.md                    # This file
```

## 🤝 Contributing

If you're a developer helping improve this system, please review the [API DOCUMENTATION](./API_DOCUMENTATION.md) for technical details.

---

**Last Updated**: April 2026  
**Version**: 1.0.0
