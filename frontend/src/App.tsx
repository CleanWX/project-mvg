import { useState } from "react";
import BookingPage from "./components/BookingPage";
import AdminPage, { Booking } from "./components/AdminPage";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Calendar, Shield, LogOut } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"booking" | "admin">("booking");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Simple password (in production, this should use proper authentication)
  const ADMIN_PASSWORD = "admin123";

  const [bookings, setBookings] = useState<Booking[]>([
    // Mock data for demonstration
    {
      id: "1",
      date: new Date(2025, 9, 15),
      name: "John Doe",
      email: "john@example.com",
      additionalInfo: "Need access in the morning",
      status: "pending",
      submittedAt: new Date(2025, 9, 10, 14, 30),
    },
    {
      id: "2",
      date: new Date(2025, 9, 22),
      name: "Jane Smith",
      email: "jane@example.com",
      additionalInfo: "",
      status: "approved",
      submittedAt: new Date(2025, 9, 8, 9, 15),
    },
  ]);

  // Dates manually blocked by admin
  const [blockedDates, setBlockedDates] = useState<Date[]>([
    new Date(2025, 9, 20),
    new Date(2025, 9, 25),
    new Date(2025, 10, 5),
    new Date(2025, 10, 12),
  ]);

  const handleBookingSubmit = (booking: {
    date: Date;
    name: string;
    email: string;
    additionalInfo: string;
  }) => {
    const newBooking: Booking = {
      id: Date.now().toString(),
      date: booking.date,
      name: booking.name,
      email: booking.email,
      additionalInfo: booking.additionalInfo,
      status: "pending",
      submittedAt: new Date(),
    };

    setBookings([...bookings, newBooking]);
  };

  const handleApprove = (id: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status: "approved" as const } : booking
      )
    );
  };

  const handleDecline = (id: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status: "declined" as const } : booking
      )
    );
  };

  const handleBlockDate = (date: Date) => {
    // Check if date is already blocked
    const isAlreadyBlocked = blockedDates.some(
      (blockedDate: { getDate: () => number; getMonth: () => number; getFullYear: () => number; }) =>
        blockedDate.getDate() === date.getDate() &&
        blockedDate.getMonth() === date.getMonth() &&
        blockedDate.getFullYear() === date.getFullYear()
    );

    if (!isAlreadyBlocked) {
      setBlockedDates([...blockedDates, date]);
    }
  };

  const handleUnblockDate = (dateToRemove: Date) => {
    setBlockedDates(
      blockedDates.filter(
        (date: { getDate: () => number; getMonth: () => number; getFullYear: () => number; }) =>
          !(
            date.getDate() === dateToRemove.getDate() &&
            date.getMonth() === dateToRemove.getMonth() &&
            date.getFullYear() === dateToRemove.getFullYear()
          )
      )
    );
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setCurrentView("admin");
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setCurrentView("admin");
      setShowLoginDialog(false);
      setLoginPassword("");
      setLoginError("");
    } else {
      setLoginError("Incorrect password. Please try again.");
      setLoginPassword("");
    }
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentView("booking");
  };

  // Get all unavailable dates (blocked by admin + approved bookings)
  const allUnavailableDates = [
    ...blockedDates,
    ...bookings
      .filter((b: { status: string; }) => b.status === "approved")
      .map((b: { date: any; }) => b.date),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <div className="inline-flex rounded-lg shadow-lg bg-white p-1">
            <Button
              variant={currentView === "booking" ? "default" : "ghost"}
              onClick={() => setCurrentView("booking")}
              className="rounded-md"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Rezervēt dienu
            </Button>
            <Button
              variant={currentView === "admin" ? "default" : "ghost"}
              onClick={handleAdminClick}
              className="rounded-md"
            >
              <Shield className="w-4 h-4 mr-2" />
              Administratora panelis
            </Button>
          </div>

          {/* Logout button when authenticated */}
          {isAdminAuthenticated && (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="shadow-lg"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>

        {/* Content */}
        {currentView === "booking" ? (
          <div>
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-slate-900 mb-2">Book a Day</h1>
              <p className="text-slate-600">
                Izvēlieties pieejamu datumu un aizpildiet savus datus, lai rezervētu
              </p>
            </div>

            <BookingPage
              unavailableDates={allUnavailableDates}
              onBookingSubmit={handleBookingSubmit}
            />
          </div>
        ) : (
          <AdminPage
            bookings={bookings}
            blockedDates={blockedDates}
            onApprove={handleApprove}
            onDecline={handleDecline}
            onBlockDate={handleBlockDate}
            onUnblockDate={handleUnblockDate}
          />
        )}
      </div>

      {/* Admin Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Administratora pieslēgšanās
            </DialogTitle>
            <DialogDescription>
              Ievadiet administratora paroli, lai piekļūtu administratora panelim
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="password">Parole</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={loginPassword}
                onChange={(e: { target: { value: any; }; }) => {
                  setLoginPassword(e.target.value);
                  setLoginError("");
                }}
                className="mt-1"
                autoFocus
              />
              {loginError && (
                <p className="text-sm text-red-600 mt-2">{loginError}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Demo pass: <code className="bg-slate-100 px-1 py-0.5 rounded">admin123</code>
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">
                Pieslēgties
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowLoginDialog(false);
                  setLoginPassword("");
                  setLoginError("");
                }}
                className="flex-1"
              >
                Atcelt
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
