import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from '../utils/api';
import './MyBookings.css';

const statusColors = {
  pending: '#fff3cd',
  confirmed: '#d4edda',
  cancelled: '#f8d7da',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch {
      toast.error('Could not load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch {
      toast.error('Could not cancel booking');
    }
  };

  if (loading) return <div className="loading-screen">Loading your bookings...</div>;

  return (
    <div className="bookings-page container">
      <h1>My Bookings</h1>
      <p className="bookings-sub">Manage all your upcoming and past trips</p>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <span>🗺️</span>
          <h3>No bookings yet!</h3>
          <p>Time to plan your next adventure.</p>
          <a href="/trips" className="btn btn-primary">Explore Trips</a>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(b => (
            <div key={b._id} className="booking-item">
              <img src={b.trip?.image} alt={b.trip?.title} className="booking-img" />
              <div className="booking-info">
                <h3>{b.trip?.title}</h3>
                <p>📍 {b.trip?.destination} &nbsp;|&nbsp; ⏱ {b.trip?.duration} days</p>
                <p>🗓 Travel Date: <strong>{new Date(b.travelDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong></p>
                <p>👥 Travelers: <strong>{b.travelers}</strong></p>
                {b.specialRequests && <p>📝 {b.specialRequests}</p>}
              </div>
              <div className="booking-status-block">
                <span className="booking-amount">₹{b.totalAmount.toLocaleString()}</span>
                <span
                  className="status-badge"
                  style={{ background: statusColors[b.status] }}
                >
                  {b.status.toUpperCase()}
                </span>
                {b.status !== 'cancelled' && (
                  <button onClick={() => handleCancel(b._id)} className="btn btn-outline cancel-btn">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
