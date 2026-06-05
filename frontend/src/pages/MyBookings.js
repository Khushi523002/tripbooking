import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking, markNotificationRead } from '../utils/api';
import './MyBookings.css';

const statusColors = {
  pending: '#fff3cd', active: '#cce5ff',
  confirmed: '#d4edda', rejected: '#f8d7da', cancelled: '#e2e3e5',
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await getMyBookings();
      setBookings(res.data);
    } catch { toast.error('Could not load bookings'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await cancelBooking(id); toast.success('Booking cancelled'); fetchBookings(); }
    catch { toast.error('Could not cancel'); }
  };

  const handleReadNotification = async (id) => {
    try { await markNotificationRead(id); fetchBookings(); } catch {}
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div className="loading-screen">Loading your bookings...</div>;

  const unread = bookings.filter(b => !b.notificationRead && ['confirmed','rejected'].includes(b.status));

  return (
    <div className="bookings-page container">
      <h1>My Bookings</h1>
      <p className="bookings-sub">Track your trips and notifications</p>

      {unread.length > 0 && (
        <div className="notif-banner">
          🔔 You have {unread.length} new update{unread.length > 1 ? 's' : ''} on your bookings — check below!
        </div>
      )}

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
            <div key={b._id} className={`booking-item ${!b.notificationRead && ['confirmed','rejected'].includes(b.status) ? 'has-notif' : ''}`}>
              <img src={b.trip?.image} alt={b.trip?.title} className="booking-img" />

              <div className="booking-info">
                <h3>{b.trip?.title}</h3>
                <p>📍 {b.trip?.destination} &nbsp;|&nbsp; ⏱ {b.trip?.duration} days</p>
                <p>🗓 Travel Date: <strong>{new Date(b.travelDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong></p>
                <p>👥 Travelers: <strong>{b.travelers}</strong></p>

                {/* Confirmed — show full trip details */}
                {b.status === 'confirmed' && (
                  <div className="agency-card">
                    <p className="agency-title">✅ Your Trip is Confirmed!</p>

                    {b.agencyName && <p>🏢 <strong>Agency:</strong> {b.agencyName}</p>}
                    {b.agencyContact && <p>📞 <strong>Agency Contact:</strong> {b.agencyContact}</p>}
                    {b.emergencyContact && <p>🚨 <strong>Emergency:</strong> {b.emergencyContact}</p>}

                    {(b.meetingPoint || b.reportingTime) && (
                      <div className="trip-detail-section">
                        {b.meetingPoint && <p>📍 <strong>Meeting Point:</strong> {b.meetingPoint}</p>}
                        {b.reportingTime && <p>⏰ <strong>Reporting Time:</strong> {b.reportingTime}</p>}
                      </div>
                    )}

                    {expanded[b._id] && (
                      <>
                        {b.guideContact && <p>🧭 <strong>Guide:</strong> {b.guideContact}</p>}
                        {b.vehicleDetails && <p>🚗 <strong>Vehicle:</strong> {b.vehicleDetails}</p>}
                        {b.hotelName && <p>🏨 <strong>Hotel:</strong> {b.hotelName}</p>}
                        {b.hotelContact && <p>📞 <strong>Hotel Contact:</strong> {b.hotelContact}</p>}
                        {b.itinerarySummary && (
                          <div className="itinerary-box">
                            <p><strong>📋 Itinerary:</strong></p>
                            <p style={{ whiteSpace: 'pre-wrap' }}>{b.itinerarySummary}</p>
                          </div>
                        )}
                        {b.adminNote && <p className="admin-note-user">📝 <strong>Note:</strong> {b.adminNote}</p>}
                      </>
                    )}

                    {(b.guideContact || b.vehicleDetails || b.hotelName || b.itinerarySummary || b.adminNote) && (
                      <button onClick={() => toggleExpand(b._id)} className="btn-expand">
                        {expanded[b._id] ? '▲ Show less' : '▼ Show full details'}
                      </button>
                    )}
                  </div>
                )}

                {b.status === 'rejected' && b.adminNote && (
                  <div className="reject-note">❌ Reason: {b.adminNote}</div>
                )}
              </div>

              <div className="booking-status-block">
                <span className="booking-amount">₹{b.totalAmount?.toLocaleString()}</span>
                <span className="status-badge" style={{ background: statusColors[b.status] }}>
                  {b.status.toUpperCase()}
                </span>
                {b.paymentStatus && b.paymentStatus !== 'unpaid' && (
                  <span className="payment-badge">{b.paymentStatus}</span>
                )}
                {!b.notificationRead && ['confirmed', 'rejected'].includes(b.status) && (
                  <button onClick={() => handleReadNotification(b._id)} className="btn btn-outline notif-read-btn">
                    Mark as read ✓
                  </button>
                )}
                {['pending', 'active'].includes(b.status) && (
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
