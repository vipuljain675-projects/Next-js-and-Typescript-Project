'use client';
import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface BookingRequest {
  _id: string;
  homeId: { houseName: string; location: string; price: number };
  userId: { firstName: string; lastName: string; email: string };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  guests: { adults: number; children: number; seniors: number };
}

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHostBookings = async () => {
    try {
      const res = await api.get("/host/manage-bookings");
      setBookings(res.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHostBookings(); }, []);

  const handleAction = async (bookingId: string, action: "Accept" | "Decline") => {
    try {
      await api.post("/host/manage-bookings", { bookingId, action });
      alert(`Booking ${action}ed!`);
      fetchHostBookings(); // Refresh list
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading requests...</div>;

  return (
    <main className="container" style={{ marginTop: "120px", maxWidth: "900px" }}>
      <h1 className="fw-bold mb-4 text-start">Reservation Requests</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-5 border rounded-4 bg-light">
          <p className="text-secondary mb-0">No booking requests found for your listings.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map((booking) => (
            <div key={booking._id} className="card border rounded-4 p-4 shadow-sm text-start">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="fw-bold mb-1">{booking.homeId?.houseName}</h5>
                  <p className="text-secondary small mb-2">{booking.homeId?.location}</p>
                  <div className="badge bg-light text-dark border mb-3">
                    Status: <span className={booking.status === 'Pending' ? 'text-warning' : 'text-success'}>{booking.status}</span>
                  </div>
                </div>
                <div className="text-end">
                   <p className="fw-bold mb-0">Total: ₹{booking.totalPrice.toLocaleString()}</p>
                   <p className="small text-secondary">Guest: {booking.userId.firstName} {booking.userId.lastName}</p>
                </div>
              </div>

              <div className="row bg-light rounded-3 p-3 g-2 mb-3">
                <div className="col-sm-6">
                  <div className="small text-secondary">DATES</div>
                  <div className="fw-semibold small">
                    {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="small text-secondary">GUESTS</div>
                  <div className="fw-semibold small">
                    {booking.guests.adults + booking.guests.children + booking.guests.seniors} Guests
                  </div>
                </div>
              </div>

              {booking.status === "Pending" && (
                <div className="d-flex gap-2">
                  <button 
                    onClick={() => handleAction(booking._id, "Accept")}
                    className="btn btn-dark grow py-2 fw-bold rounded-3"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleAction(booking._id, "Decline")}
                    className="btn btn-outline-danger grow py-2 fw-bold rounded-3"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}