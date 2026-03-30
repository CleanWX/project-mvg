import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Calendar as CalendarComponent } from "./ui/calendar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "./ui/alert-dialog";
import { Check, X, Calendar, User, Mail, MessageSquare, Ban, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { api, Booking, BlockedDate } from "../api";

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedDateToBlock, setSelectedDateToBlock] = useState<Date | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"approve" | "decline" | "delete" | null>(null);
  const [sortCol, setSortCol] = useState("submitted_at");
  const [sortDir, setSortDir] = useState<"ASC" | "DESC">("DESC");
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const res = await api.bookings.list({
        archived: showArchive ? "1" : "0",
        sort: sortCol,
        dir: sortDir,
      });
      setBookings(res.bookings);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    }
  };

  const loadBlockedDates = async () => {
    try {
      const res = await api.blockedDates.list();
      setBlockedDates(res.blocked_dates);
    } catch (err) {
      console.error("Failed to load blocked dates:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadBookings(), loadBlockedDates()]).finally(() => setLoading(false));
  }, [showArchive, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === "ASC" ? "DESC" : "ASC");
    } else {
      setSortCol(col);
      setSortDir("ASC");
    }
  };

  const handleApprove = async (id: number) => {
    await api.bookings.update(id, { status: "approved" });
    loadBookings();
  };

  const handleDecline = async (id: number) => {
    await api.bookings.update(id, { status: "declined" });
    loadBookings();
  };

  const handleArchive = async (id: number) => {
    await api.bookings.update(id, { is_archived: true });
    loadBookings();
  };

  const handleUnarchive = async (id: number) => {
    await api.bookings.update(id, { is_archived: false });
    loadBookings();
  };

  const handleDelete = async (id: number) => {
    await api.bookings.delete(id);
    loadBookings();
  };

  const handleBlockDate = async () => {
    if (!selectedDateToBlock) return;
    const date = selectedDateToBlock.toISOString().split("T")[0];
    await api.blockedDates.block(date);
    setSelectedDateToBlock(undefined);
    loadBlockedDates();
  };

  const handleUnblockDate = async (id: number) => {
    await api.blockedDates.unblock(id);
    loadBlockedDates();
  };

  const confirmAction = async () => {
    if (!selectedBooking || !actionType) return;
    if (actionType === "approve") await handleApprove(selectedBooking.id);
    if (actionType === "decline") await handleDecline(selectedBooking.id);
    if (actionType === "delete") await handleDelete(selectedBooking.id);
    setSelectedBooking(null);
    setActionType(null);
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":  return <Badge variant="outline">Pending</Badge>;
      case "approved": return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case "declined": return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>;
    }
  };

  const sortArrow = (col: string) => sortCol === col ? (sortDir === "ASC" ? " ↑" : " ↓") : "";

  const pendingBookings   = bookings.filter(b => b.status === "pending");
  const processedBookings = bookings.filter(b => b.status !== "pending");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-slate-900 mb-2">Administrators</h1>
        <p className="text-slate-600">Apskatit un managet rezervācijas pieprasījumus un bloķēt datumus</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-slate-900 mt-1">{bookings.filter(b => b.status === "pending").length}</p>
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
              <p className="text-slate-900 mt-1">{bookings.filter(b => b.status === "approved").length}</p>
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
              <p className="text-slate-900 mt-1">{bookings.filter(b => b.status === "declined").length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Blokētie datumi</p>
              <p className="text-slate-900 mt-1">{blockedDates.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Ban className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Block Dates */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 shadow-lg">
          <h2 className="text-slate-900 mb-2">Bloķēt datumu</h2>
          <p className="text-sm text-slate-600 mb-4">Izvēlieties datumus, kurus vēlaties bloķēt</p>
          <CalendarComponent
            mode="single"
            selected={selectedDateToBlock}
            onSelect={setSelectedDateToBlock}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border"
          />
          <Button onClick={handleBlockDate} disabled={!selectedDateToBlock} className="w-full mt-4">
            <Ban className="w-4 h-4 mr-2" />
            Bloķēt izvēlēto datumu
          </Button>
        </Card>

        <Card className="p-6 shadow-lg">
          <h2 className="text-slate-900 mb-2">Bloķētie datumi</h2>
          <p className="text-sm text-slate-600 mb-4">Datumi kas ir bloķēti no rezervēšanas</p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {blockedDates.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Ban className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nav bloķētu datumu</p>
              </div>
            ) : (
              blockedDates.map((bd) => (
                <div key={bd.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm">{new Date(bd.blocked_date + 'T00:00:00').toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}</span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleUnblockDate(bd.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Archive toggle */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowArchive(!showArchive)}>
          <Archive className="w-4 h-4 mr-2" />
          {showArchive ? "Rādīt aktīvos" : "Rādīt arhīvu"}
        </Button>
      </div>

      {/* Pending Bookings */}
      {!showArchive && (
        <Card className="shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-slate-900">Neapstrādātie pieprasījumi</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Ielādē...</div>
            ) : pendingBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Nav neapstrādātu pieprasījumu</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("booking_date")}>Datums{sortArrow("booking_date")}</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>Vārds{sortArrow("name")}</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>Epasts{sortArrow("email")}</TableHead>
                    <TableHead>Papildu info</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("submitted_at")}>Iesniegts{sortArrow("submitted_at")}</TableHead>
                    <TableHead className="text-right">Darbības</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                        {booking.additional_info ? (
                          <div className="flex items-center gap-2 max-w-xs">
                            <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{booking.additional_info}</span>
                          </div>
                        ) : <span className="text-slate-400">-</span>}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(booking.submitted_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => { setSelectedBooking(booking); setActionType("approve"); }}>
                            <Check className="w-4 h-4 mr-1" />Apstiprināt
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedBooking(booking); setActionType("decline"); }}>
                            <X className="w-4 h-4 mr-1" />Atteikt
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleArchive(booking.id)}>
                            <Archive className="w-4 h-4" />
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
      )}

      {/* Processed / Archived Bookings */}
      <Card className="shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-slate-900">{showArchive ? "Arhīvs" : "Apstrādātie pieprasījumi"}</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Ielādē...</div>
          ) : processedBookings.length === 0 && !showArchive ? (
            <div className="p-12 text-center text-slate-500">
              <p>Vēl nav apstrādātu pieprasījumu</p>
            </div>
          ) : bookings.length === 0 && showArchive ? (
            <div className="p-12 text-center text-slate-500">
              <Archive className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Arhīvs ir tukšs</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("booking_date")}>Datums{sortArrow("booking_date")}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>Vārds{sortArrow("name")}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>Epasts{sortArrow("email")}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>Statuss{sortArrow("status")}</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("submitted_at")}>Iesniegts{sortArrow("submitted_at")}</TableHead>
                  <TableHead className="text-right">Darbības</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(showArchive ? bookings : processedBookings).map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      {new Date(booking.booking_date + 'T00:00:00').toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell>{booking.name}</TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(booking.submitted_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {showArchive ? (
                          <Button size="sm" variant="outline" onClick={() => handleUnarchive(booking.id)}>
                            <ArchiveRestore className="w-4 h-4 mr-1" />Atjaunot
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleArchive(booking.id)}>
                            <Archive className="w-4 h-4 mr-1" />Arhivēt
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => { setSelectedBooking(booking); setActionType("delete"); }}>
                          <Trash2 className="w-4 h-4" />
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

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedBooking && !!actionType} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Apstiprināt rezervāciju" : actionType === "decline" ? "Atteikt rezervāciju" : "Dzēst rezervāciju"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete"
                ? `Vai tiešām vēlaties neatgriezeniski dzēst šo rezervāciju priekš ${selectedBooking?.name}?`
                : actionType === "approve"
                ? `Vai tiešām vēlaties apstiprināt rezervāciju priekš ${selectedBooking?.name}?`
                : `Vai tiešām vēlaties atteikt rezervāciju priekš ${selectedBooking?.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedBooking(null)}>Atcelt</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {actionType === "approve" ? "Apstiprināt" : actionType === "decline" ? "Atteikt" : "Dzēst"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
