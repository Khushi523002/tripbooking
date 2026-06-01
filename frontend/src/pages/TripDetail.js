import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTrip, createBooking } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './TripDetail.css';

export default function TripDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ travelers: 1, travelDate: '', specialRequests: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await getTrip(id);
        setTrip(res.data);
      } catch {
        toast.error('Trip not found');
        navigate('/trips');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!booking.travelDate) { toast.error('Please select a travel date'); return; }

    setBookingLoading(true);
    try {
      await createBooking({ tripId: trip._id, ...booking });
      toast.success('Booking confirmed! 🎉');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="loading-screen">Loading trip details...</div>;
  if (!trip) return null;

  const total = trip.price * booking.travelers;

  return (
    <div className="trip-detail">
      {/* Hero */}
      <div className="detail-hero" style={{ backgroundImage: `url(${trip.image})` }}>
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <div className="detail-badges">
            <span className={`badge badge-${trip.difficulty}`}>{trip.difficulty}</span>
            <span className="badge badge-category">{trip.category}</span>
          </div>
          <h1>{trip.title}</h1>
          <div className="detail-meta">
            <span>📍 {trip.destination}</span>
            <span>⏱ {trip.duration} days</span>
            <span>👥 Max {trip.maxGroupSize} people</span>
            <span>⭐ {trip.rating} ({trip.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container detail-layout">
        <div className="detail-main">
          <section>
            <h2>About This Trip</h2>
            <p>{trip.description}</p>
          </section>

          {trip.highlights?.length > 0 && (
            <section>
              <h2>Highlights</h2>
              <ul className="highlight-list">
                {trip.highlights.map((h, i) => <li key={i}>✨ {h}</li>)}
              </ul>
            </section>
          )}

          {trip.included?.length > 0 && (
            <section>
              <h2>What's Included</h2>
              <ul className="included-list">
                {trip.included.map((item, i) => <li key={i}>✅ {item}</li>)}
              </ul>
            </section>
          )}
        </div>

        {/* Booking Card */}
        <aside className="booking-card">
          <div className="booking-price">
            <span className="big-price">₹{trip.price.toLocaleString()}</span>
            <span className="price-label"> / person</span>
          </div>

          <form onSubmit={handleBook} className="booking-form">
            <div className="form-group">
              <label>Number of Travelers</label>
              <input
                type="number"
                min="1"
                max={trip.maxGroupSize}
                value={booking.travelers}
                onChange={e => setBooking({ ...booking, travelers: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Travel Date</label>
              <input
                type="date"
                value={booking.travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setBooking({ ...booking, travelDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Special Requests (optional)</label>
              <textarea
                rows="3"
                placeholder="Any dietary needs, accessibility requirements..."
                value={booking.specialRequests}
                onChange={e => setBooking({ ...booking, specialRequests: e.target.value })}
              />
            </div>

            <div className="booking-total">
              <span>Total Amount</span>
              <span className="total-amount">₹{total.toLocaleString()}</span>
            </div>

            <button
              type="submit"
              className="btn btn-accent"
              style={{ width: '100%', justifyContent: 'center', borderRadius: '12px', padding: '16px' }}
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Booking...' : user ? 'Book Now 🎉' : 'Login to Book'}
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
