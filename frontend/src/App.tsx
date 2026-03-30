import { useState, useEffect } from "react";
import BookingPage from "./components/BookingPage";
import AdminPage from "./components/AdminPage";
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
import { api } from "./api";

export default function App() {
  const [currentView, setCurrentView] = useState<"booking" | "admin">("booking");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

  // Load unavailable dates from backend on mount
  useEffect(() => {
    api.bookings.unavailable().then(res => {
      setUnavailableDates(res.unavailable.map(d => new Date(d + 'T00:00:00')));
    }).catch(err => console.error('Failed to load unavailable dates:', err));
  }, []);

  // Check if already logged in
  useEffect(() => {
    api.auth.check().then(res => {
      if (res.authenticated) {
        setIsAdminAuthenticated(true);
      }
    }).catch(() => {});
  }, []);

  const handleBookingSubmit = async (booking: {
    date: Date;
    name: string;
    email: string;
    additionalInfo: string;
  }) => {
    await api.bookings.create({
      date: booking.date.toISOString().split('T')[0],
      name: booking.name,
      email: booking.email,
      additionalInfo: booking.additionalInfo,
    });
    // Refresh unavailable dates after new booking
    api.bookings.unavailable().then(res => {
      setUnavailableDates(res.unavailable.map(d => new Date(d + 'T00:00:00')));
    });
  };

  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setCurrentView("admin");
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.auth.login(loginUsername, loginPassword);
      setIsAdminAuthenticated(true);
      setCurrentView("admin");
      setShowLoginDialog(false);
      setLoginUsername("");
      setLoginPassword("");
      setLoginError("");
    } catch (err: any) {
      setLoginError("Incorrect credentials. Please try again.");
      setLoginPassword("");
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setIsAdminAuthenticated(false);
    setCurrentView("booking");
  };

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
            <div className="text-center mb-12">
              <h1 className="text-slate-900 mb-2">Book a Day</h1>
              <p className="text-slate-600">
                Izvēlieties pieejamu datumu un aizpildiet savus datus, lai rezervētu
              </p>
            </div>
            <BookingPage
              unavailableDates={unavailableDates}
              onBookingSubmit={handleBookingSubmit}
            />
          </div>
        ) : (
          <AdminPage />
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
              Ievadiet administratora datus, lai piekļūtu administratora panelim
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="username">Lietotājvārds</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={loginUsername}
                onChange={(e: { target: { value: any; }; }) => {
                  setLoginUsername(e.target.value);
                  setLoginError("");
                }}
                className="mt-1"
                autoFocus
              />
            </div>
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
              />
              {loginError && (
                <p className="text-sm text-red-600 mt-2">{loginError}</p>
              )}
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
                  setLoginUsername("");
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
