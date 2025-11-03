import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar as CalendarComponent } from "./ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Check, X, Calendar, User, Mail, MessageSquare, Ban, Trash2 } from "lucide-react";

export interface Booking {
  id: string;
  date: Date;
  name: string;
  email: string;
  additionalInfo: string;
  status: "pending" | "approved" | "declined";
  submittedAt: Date;
}

interface AdminPageProps {
  bookings: Booking[];
  blockedDates: Date[];
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
  onBlockDate: (date: Date) => void;
  onUnblockDate: (date: Date) => void;
}

export default function AdminPage({
  bookings,
  blockedDates,
  onApprove,
  onDecline,
  onBlockDate,
  onUnblockDate,
}: AdminPageProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"approve" | "decline" | null>(
    null
  );
  const [selectedDateToBlock, setSelectedDateToBlock] = useState<Date | undefined>();

  const handleAction = (booking: Booking, action: "approve" | "decline") => {
    setSelectedBooking(booking);
    setActionType(action);
  };

  const confirmAction = () => {
    if (selectedBooking && actionType) {
      if (actionType === "approve") {
        onApprove(selectedBooking.id);
      } else {
        onDecline(selectedBooking.id);
      }
      setSelectedBooking(null);
      setActionType(null);
    }
  };

  const cancelAction = () => {
    setSelectedBooking(null);
    setActionType(null);
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "declined":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>;
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const processedBookings = bookings.filter((b) => b.status !== "pending");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">
          Review and manage booking requests
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Requests</p>
              <p className="text-slate-900 mt-1">{pendingBookings.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-slate-900 mt-1">
                {bookings.filter((b) => b.status === "approved").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Declined</p>
              <p className="text-slate-900 mt-1">
                {bookings.filter((b) => b.status === "declined").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Blocked Dates</p>
              <p className="text-slate-900 mt-1">{blockedDates.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Ban className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Block Dates Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-slate-900 mb-2">Block Dates</h2>
            <p className="text-sm text-slate-600">
              Select dates to prevent bookings
            </p>
          </div>
          <CalendarComponent
            mode="single"
            selected={selectedDateToBlock}
            onSelect={setSelectedDateToBlock}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border"
          />
          <Button
            onClick={() => {
              if (selectedDateToBlock) {
                onBlockDate(selectedDateToBlock);
                setSelectedDateToBlock(undefined);
              }
            }}
            disabled={!selectedDateToBlock}
            className="w-full mt-4"
          >
            <Ban className="w-4 h-4 mr-2" />
            Block Selected Date
          </Button>
        </Card>

        <Card className="p-6 shadow-lg">
          <div className="mb-4">
            <h2 className="text-slate-900 mb-2">Currently Blocked Dates</h2>
            <p className="text-sm text-slate-600">
              Dates that are blocked from booking
            </p>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {blockedDates.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Ban className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No dates are currently blocked</p>
              </div>
            ) : (
              blockedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map((date, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">
                        {date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUnblockDate(date)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card className="shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-slate-900">Pending Requests</h2>
        </div>
        <div className="overflow-x-auto">
          {pendingBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No pending booking requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Additional Info</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {booking.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        {booking.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {booking.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.additionalInfo ? (
                        <div className="flex items-center gap-2 max-w-xs">
                          <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="truncate">
                            {booking.additionalInfo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {booking.submittedAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleAction(booking, "approve")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(booking, "decline")}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Processed Requests */}
      <Card className="shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-slate-900">Processed Requests</h2>
        </div>
        <div className="overflow-x-auto">
          {processedBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p>No processed requests yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {booking.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {booking.submittedAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={!!selectedBooking && !!actionType}
        onOpenChange={(open) => !open && cancelAction()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Approve Booking" : "Decline Booking"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" ? (
                <>
                  Are you sure you want to approve this booking for{" "}
                  <span className="text-slate-900">
                    {selectedBooking?.name}
                  </span>{" "}
                  on{" "}
                  <span className="text-slate-900">
                    {selectedBooking?.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  ?
                </>
              ) : (
                <>
                  Are you sure you want to decline this booking for{" "}
                  <span className="text-slate-900">
                    {selectedBooking?.name}
                  </span>
                  ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelAction}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionType === "approve" ? "Approve" : "Decline"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
