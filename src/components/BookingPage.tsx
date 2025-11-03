import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingPageProps {
  unavailableDates: Date[];
  onBookingSubmit: (booking: {
    date: Date;
    name: string;
    email: string;
    additionalInfo: string;
  }) => void;
}

export default function BookingPage({
  unavailableDates,
  onBookingSubmit,
}: BookingPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    additionalInfo: "",
  });

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.getDate() === date.getDate() &&
        unavailableDate.getMonth() === date.getMonth() &&
        unavailableDate.getFullYear() === date.getFullYear()
    );
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Saturday = 6, Sunday = 0
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && formData.name && formData.email) {
      onBookingSubmit({
        date: selectedDate,
        name: formData.name,
        email: formData.email,
        additionalInfo: formData.additionalInfo,
      });
      setShowConfirmation(true);
    }
  };

  const handleReset = () => {
    setSelectedDate(undefined);
    setFormData({
      name: "",
      email: "",
      additionalInfo: "",
    });
  };

  const handleDialogClose = () => {
    setShowConfirmation(false);
    handleReset();
  };

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <Card className="p-6 shadow-lg">
          <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-slate-900">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar */}
            <div className="calendar-container">
              <style>{`
                .calendar-container .rdp-day_button {
                  border-radius: 8px;
                  transition: all 0.2s;
                }
                .calendar-container .rdp-day_button:hover {
                  transform: scale(1.05);
                }
                .day-available .rdp-day_button {
                  background-color: #dcfce7;
                  color: #166534;
                }
                .day-available .rdp-day_button:hover {
                  background-color: #bbf7d0;
                }
                .day-unavailable .rdp-day_button {
                  background-color: #fee2e2;
                  color: #991b1b;
                  cursor: not-allowed;
                }
                .day-unavailable .rdp-day_button:hover {
                  background-color: #fee2e2;
                  transform: scale(1);
                }
                .day-hidden {
                  opacity: 0.3;
                  pointer-events: none;
                }
                .rdp-day_selected .rdp-day_button {
                  background-color: #3b82f6 !important;
                  color: white !important;
                }
              `}</style>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                disabled={(date) =>
                  isDateUnavailable(date) ||
                  isWeekend(date) ||
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                modifiers={{
                  available: (date) =>
                    !isDateUnavailable(date) && !isWeekend(date),
                  unavailable: (date) =>
                    isDateUnavailable(date) || isWeekend(date),
                }}
                modifiersClassNames={{
                  available: "day-available",
                  unavailable: "day-unavailable",
                }}
              />
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <span className="text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 rounded"></div>
                <span className="text-slate-600">Unavailable</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Form Section */}
        <Card className="p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-slate-900 mb-4">Your Details</h2>
            </div>

            {/* Selected Date Display */}
            {selectedDate && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  Selected Date:{" "}
                  <span>
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
            )}

            {/* Name Field */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>

            {/* Additional Info Field */}
            <div>
              <Label htmlFor="info">Additional Information</Label>
              <Textarea
                id="info"
                placeholder="Any special requests or notes..."
                value={formData.additionalInfo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalInfo: e.target.value,
                  })
                }
                className="mt-1 resize-none"
                rows={4}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 shadow-md"
                disabled={!selectedDate || !formData.name || !formData.email}
              >
                Book Now
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <span>Booking Submitted!</span>
            </DialogTitle>
            <DialogDescription className="pt-4">
              Your booking request for{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              has been submitted successfully. You'll receive a confirmation
              email at {formData.email} once the admin reviews your request.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={handleDialogClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
