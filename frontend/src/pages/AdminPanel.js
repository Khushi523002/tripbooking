import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getAllBookings, activateBooking, confirmBooking, rejectBooking,
  deleteBooking, getTrips, createTrip, updateTrip, deleteTrip,
  getAllUsers, updateUser, deleteUser,
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const STATUS_COLORS = {
  pending: '#fff3cd', active: '#cce5ff',
  confirmed: '#d4edda', rejected: '#f8d7da', cancelled: '#e2e3e5',
};

const EMPTY_TRIP = {
  title: '', destination: '', description: '', image: '',
  price: '', duration: '', maxGroupSize: '', difficulty: 'easy',
  category: 'adventure', featured: false, rating: 0, reviewCount: 0,
  highlights: '', included: '',
};

const EMPTY_CONFIRM = {
  agencyName: '', agencyContact: '', meetingPoint: '', reportingTime: '',
  guideContact: '', vehicleDetails: '', hotelName: '', hotelContact: '',
  emergencyContact: '', itinerarySummary: '', adminNote: '', paymentStatus: 'unpaid',
};

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('bookings');

  // Bookings
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [confirmForm, setConfirmForm] = useState(EMPTY_CONFIRM);
  const [rejectNote, setRejectNote] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

  // Trips
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripModal, setTripModal] = useState(null); // { mode: 'create'|'edit', trip? }
  const [tripForm, setTripForm] = useState(EMPTY_TRIP);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/'); return; }
    fetchBookings();
    fetchTrips();
    fetchUsers();
  }, []);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try { const r = await getAllBookings(); setBookings(r.data); }
    catch { toast.error('Could not load bookings'); }
    finally { setBookingsLoading(false); }
  }, []);

  const fetchTrips = useCallback(async () => {
    setTripsLoading(true);
    try { const r = await getTrips(); setTrips(r.data); }
    catch { toast.error('Could not load trips'); }
    finally { setTripsLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try { const r = await getAllUsers(); setUsers(r.data); }
    catch { toast.error('Could not load users'); }
    finally { setUsersLoading(false); }
  }, []);

  // ── BOOKING ACTIONS ──────────────────────────────────────────────
  const handleActivate = async (id) => {
    try { await activateBooking(id); toast.success('Booking activated!'); fetchBookings(); }
    catch { toast.error('Failed to activate'); }
  };

  const handleConfirm = async () => {
    try {
      await confirmBooking(modal.bookingId, confirmForm);
      toast.success('Booking confirmed! User will be notified.');
      closeModal();
      fetchBookings();
    } catch { toast.error('Failed to confirm'); }
  };

  const handleReject = async () => {
    try {
      await rejectBooking(modal.bookingId, { adminNote: rejectNote });
      toast.success('Booking rejected.');
      closeModal();
      fetchBookings();
    } catch { toast.error('Failed to reject'); }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try { await deleteBooking(id); toast.success('Booking deleted.'); fetchBookings(); }
    catch { toast.error('Failed to delete'); }
  };

  const closeModal = () => {
    setModal(null);
    setConfirmForm(EMPTY_CONFIRM);
    setRejectNote('');
  };

  const openConfirm = (b) => {
    setConfirmForm({
      agencyName: b.agencyName || '', agencyContact: b.agencyContact || '',
      meetingPoint: b.meetingPoint || '', reportingTime: b.reportingTime || '',
      guideContact: b.guideContact || '', vehicleDetails: b.vehicleDetails || '',
      hotelName: b.hotelName || '', hotelContact: b.hotelContact || '',
      emergencyContact: b.emergencyContact || '', itinerarySummary: b.itinerarySummary || '',
      adminNote: b.adminNote || '', paymentStatus: b.paymentStatus || 'unpaid',
    });
    setModal({ type: 'confirm', bookingId: b._id, booking: b });
  };

  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter(b => b.status === bookingFilter);

  // ── TRIP ACTIONS ─────────────────────────────────────────────────
  const openTripCreate = () => { setTripForm(EMPTY_TRIP); setTripModal({ mode: 'create' }); };
  const openTripEdit = (t) => {
    setTripForm({
      ...t,
      highlights: Array.isArray(t.highlights) ? t.highlights.join(', ') : t.highlights,
      included: Array.isArray(t.included) ? t.included.join(', ') : t.included,
    });
    setTripModal({ mode: 'edit', tripId: t._id });
  };

  const handleTripSave = async () => {
    const payload = {
      ...tripForm,
      price: Number(tripForm.price),
      duration: Number(tripForm.duration),
      maxGroupSize: Number(tripForm.maxGroupSize),
      highlights: typeof tripForm.highlights === 'string'
        ? tripForm.highlights.split(',').map(s => s.trim()).filter(Boolean)
        : tripForm.highlights,
      included: typeof tripForm.included === 'string'
        ? tripForm.included.split(',').map(s => s.trim()).filter(Boolean)
        : tripForm.included,
    };
    try {
      if (tripModal.mode === 'create') {
        await createTrip(payload);
        toast.success('Trip created!');
      } else {
        await updateTrip(tripModal.tripId, payload);
        toast.success('Trip updated!');
      }
      setTripModal(null);
      fetchTrips();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save trip');
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    try { await deleteTrip(id); toast.success('Trip deleted.'); fetchTrips(); }
    catch { toast.error('Failed to delete trip'); }
  };

  // ── USER ACTIONS ─────────────────────────────────────────────────
  const handleToggleAdmin = async (u) => {
    if (u._id === user._id) { toast.error("Can't change your own role"); return; }
    try {
      await updateUser(u._id, { isAdmin: !u.isAdmin });
      toast.success(u.isAdmin ? 'Admin rights removed' : 'User promoted to admin');
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const handleDeleteUser = async (u) => {
    if (u._id === user._id) { toast.error("Can't delete your own account"); return; }
    if (!window.confirm(`Delete user "${u.name}"? All their data stays but they cannot log in.`)) return;
    try { await deleteUser(u._id); toast.success('User deleted.'); fetchUsers(); }
    catch { toast.error('Failed to delete user'); }
  };

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="admin-page container">
      <div className="admin-header">
        <div>
          <h1>🛡️ Admin Panel</h1>
          <p className="admin-sub">Welcome, {user?.name} · Full control over the platform</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {['pending','active','confirmed','rejected','cancelled'].map(s => (
          <div key={s} className="stat-card" style={{ background: STATUS_COLORS[s] }}>
            <span className="stat-num">{bookings.filter(b => b.status === s).length}</span>
            <span className="stat-label">{s}</span>
          </div>
        ))}
        <div className="stat-card" style={{ background: '#e8e3ff' }}>
          <span className="stat-num">{trips.length}</span>
          <span className="stat-label">trips</span>
        </div>
        <div className="stat-card" style={{ background: '#fde8ff' }}>
          <span className="stat-num">{users.length}</span>
          <span className="stat-label">users</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {['bookings','trips','users'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'bookings' ? '📋 Bookings' : t === 'trips' ? '✈️ Trips' : '👥 Users'}
          </button>
        ))}
      </div>

      {/* ── BOOKINGS TAB ── */}
      {tab === 'bookings' && (
        <>
          <div className="filter-bar">
            {['all','pending','active','confirmed','rejected','cancelled'].map(s => (
              <button key={s}
                className={`filter-btn ${bookingFilter === s ? 'active' : ''}`}
                onClick={() => setBookingFilter(s)}
              >{s}</button>
            ))}
          </div>

          {bookingsLoading ? <div className="loading-screen">Loading...</div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th><th>Trip</th><th>Travel Date</th>
                    <th>Travelers</th><th>Amount</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No bookings found</td></tr>
                  )}
                  {filteredBookings.map(b => (
                    <tr key={b._id}>
                      <td>
                        <strong>{b.user?.name}</strong>
                        <br /><small>{b.user?.phone || b.user?.email}</small>
                      </td>
                      <td>
                        <strong>{b.trip?.title}</strong>
                        <br /><small>{b.trip?.destination}</small>
                      </td>
                      <td>{new Date(b.travelDate).toLocaleDateString('en-IN')}</td>
                      <td>{b.travelers}</td>
                      <td>₹{b.totalAmount?.toLocaleString()}</td>
                      <td>
                        <span className="status-pill" style={{ background: STATUS_COLORS[b.status] }}>
                          {b.status}
                        </span>
                        {b.paymentStatus && b.paymentStatus !== 'unpaid' && (
                          <span className="payment-pill">{b.paymentStatus}</span>
                        )}
                      </td>
                      <td className="action-btns">
                        {b.status === 'pending' && (
                          <button onClick={() => handleActivate(b._id)} className="btn-action btn-activate">Activate</button>
                        )}
                        {b.status === 'active' && (
                          <>
                            <button onClick={() => openConfirm(b)} className="btn-action btn-confirm">Confirm & Send Details</button>
                            <button onClick={() => { setRejectNote(''); setModal({ type: 'reject', bookingId: b._id }); }} className="btn-action btn-reject">Reject</button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <button onClick={() => openConfirm(b)} className="btn-action btn-edit-small">Edit Details</button>
                        )}
                        <button onClick={() => handleDeleteBooking(b._id)} className="btn-action btn-delete-sm">🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── TRIPS TAB ── */}
      {tab === 'trips' && (
        <>
          <div className="section-toolbar">
            <h2 className="section-title">All Trips</h2>
            <button onClick={openTripCreate} className="btn btn-primary">+ Add Trip</button>
          </div>
          {tripsLoading ? <div className="loading-screen">Loading...</div> : (
            <div className="trips-grid-admin">
              {trips.map(t => (
                <div key={t._id} className="trip-admin-card">
                  <div className="trip-admin-img" style={{ backgroundImage: `url(${t.image})` }}>
                    {t.featured && <span className="featured-badge">⭐ Featured</span>}
                  </div>
                  <div className="trip-admin-body">
                    <h3>{t.title}</h3>
                    <p className="trip-dest">📍 {t.destination}</p>
                    <div className="trip-meta-row">
                      <span>₹{t.price?.toLocaleString()}</span>
                      <span>{t.duration}d</span>
                      <span className="category-tag">{t.category}</span>
                    </div>
                    <div className="trip-card-actions">
                      <button onClick={() => openTripEdit(t)} className="btn-action btn-edit-small">✏️ Edit</button>
                      <button onClick={() => handleDeleteTrip(t._id)} className="btn-action btn-delete-sm">🗑️ Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <>
          <div className="section-toolbar">
            <h2 className="section-title">All Users</h2>
            <span className="user-count">{users.length} registered</span>
          </div>
          {usersLoading ? <div className="loading-screen">Loading...</div> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className={u._id === user._id ? 'self-row' : ''}>
                      <td><strong>{u.name}</strong>{u._id === user._id && <span className="you-badge"> (you)</span>}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className={`role-pill ${u.isAdmin ? 'admin' : 'user'}`}>
                          {u.isAdmin ? '🛡️ Admin' : '👤 User'}
                        </span>
                      </td>
                      <td><small>{new Date(u.createdAt).toLocaleDateString('en-IN')}</small></td>
                      <td className="action-btns">
                        <button
                          onClick={() => handleToggleAdmin(u)}
                          className={`btn-action ${u.isAdmin ? 'btn-reject' : 'btn-activate'}`}
                          disabled={u._id === user._id}
                        >{u.isAdmin ? 'Remove Admin' : 'Make Admin'}</button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="btn-action btn-delete-sm"
                          disabled={u._id === user._id}
                        >🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── CONFIRM BOOKING MODAL ── */}
      {modal?.type === 'confirm' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box modal-wide" onClick={e => e.stopPropagation()}>
            <div className="modal-modal-header">
              <h3>📋 Confirm Booking & Send Trip Details</h3>
              {modal.booking && (
                <p className="modal-subtitle">
                  {modal.booking.user?.name} · {modal.booking.trip?.title} · {modal.booking.travelers} traveler(s)
                </p>
              )}
            </div>

            <div className="modal-grid">
              <div className="modal-section">
                <h4>🏢 Travel Agency</h4>
                <div className="form-group">
                  <label>Agency Name</label>
                  <input type="text" placeholder="e.g. Sunrise Travels"
                    value={confirmForm.agencyName}
                    onChange={e => setConfirmForm({ ...confirmForm, agencyName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Agency Contact</label>
                  <input type="text" placeholder="+91 98765 43210"
                    value={confirmForm.agencyContact}
                    onChange={e => setConfirmForm({ ...confirmForm, agencyContact: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input type="text" placeholder="+91 99999 00000"
                    value={confirmForm.emergencyContact}
                    onChange={e => setConfirmForm({ ...confirmForm, emergencyContact: e.target.value })} />
                </div>
              </div>

              <div className="modal-section">
                <h4>🗺️ Trip Logistics</h4>
                <div className="form-group">
                  <label>Meeting / Reporting Point</label>
                  <input type="text" placeholder="e.g. Mumbai Airport, Terminal 2"
                    value={confirmForm.meetingPoint}
                    onChange={e => setConfirmForm({ ...confirmForm, meetingPoint: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Reporting Time</label>
                  <input type="text" placeholder="e.g. 6:00 AM on travel date"
                    value={confirmForm.reportingTime}
                    onChange={e => setConfirmForm({ ...confirmForm, reportingTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Guide Contact</label>
                  <input type="text" placeholder="Guide name & number"
                    value={confirmForm.guideContact}
                    onChange={e => setConfirmForm({ ...confirmForm, guideContact: e.target.value })} />
                </div>
              </div>

              <div className="modal-section">
                <h4>🚗 Transport & Stay</h4>
                <div className="form-group">
                  <label>Vehicle Details</label>
                  <input type="text" placeholder="e.g. Toyota Innova · MH12 AB 1234"
                    value={confirmForm.vehicleDetails}
                    onChange={e => setConfirmForm({ ...confirmForm, vehicleDetails: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Hotel / Stay Name</label>
                  <input type="text" placeholder="Hotel name"
                    value={confirmForm.hotelName}
                    onChange={e => setConfirmForm({ ...confirmForm, hotelName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Hotel Contact</label>
                  <input type="text" placeholder="Hotel phone / address"
                    value={confirmForm.hotelContact}
                    onChange={e => setConfirmForm({ ...confirmForm, hotelContact: e.target.value })} />
                </div>
              </div>

              <div className="modal-section">
                <h4>💳 Payment & Notes</h4>
                <div className="form-group">
                  <label>Payment Status</label>
                  <select value={confirmForm.paymentStatus}
                    onChange={e => setConfirmForm({ ...confirmForm, paymentStatus: e.target.value })}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Itinerary Summary</label>
                  <textarea rows="3" placeholder="Day-by-day summary..."
                    value={confirmForm.itinerarySummary}
                    onChange={e => setConfirmForm({ ...confirmForm, itinerarySummary: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Admin Note for User</label>
                  <textarea rows="2" placeholder="Any special instructions..."
                    value={confirmForm.adminNote}
                    onChange={e => setConfirmForm({ ...confirmForm, adminNote: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={closeModal} className="btn btn-outline">Cancel</button>
              <button onClick={handleConfirm} className="btn btn-primary">
                ✅ Confirm & Notify User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {modal?.type === 'reject' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>❌ Reject Booking</h3>
            <div className="form-group">
              <label>Reason for rejection</label>
              <textarea rows="4" placeholder="Explain the reason to the user..."
                value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button onClick={closeModal} className="btn btn-outline">Cancel</button>
              <button onClick={handleReject} className="btn btn-danger">Reject Booking</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRIP CREATE/EDIT MODAL ── */}
      {tripModal && (
        <div className="modal-overlay" onClick={() => setTripModal(null)}>
          <div className="modal-box modal-wide" onClick={e => e.stopPropagation()}>
            <h3>{tripModal.mode === 'create' ? '➕ Create New Trip' : '✏️ Edit Trip'}</h3>
            <div className="modal-grid">
              <div className="modal-section">
                <div className="form-group">
                  <label>Trip Title *</label>
                  <input type="text" placeholder="e.g. Bali Serenity Escape"
                    value={tripForm.title} onChange={e => setTripForm({ ...tripForm, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Destination *</label>
                  <input type="text" placeholder="e.g. Bali, Indonesia"
                    value={tripForm.destination} onChange={e => setTripForm({ ...tripForm, destination: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea rows="3" placeholder="Trip description..."
                    value={tripForm.description} onChange={e => setTripForm({ ...tripForm, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Image path / URL</label>
                  <input type="text" placeholder="assets/images/bali.jpg"
                    value={tripForm.image} onChange={e => setTripForm({ ...tripForm, image: e.target.value })} />
                </div>
              </div>

              <div className="modal-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input type="number" placeholder="45000"
                      value={tripForm.price} onChange={e => setTripForm({ ...tripForm, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Duration (days) *</label>
                    <input type="number" placeholder="7"
                      value={tripForm.duration} onChange={e => setTripForm({ ...tripForm, duration: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Max Group Size</label>
                    <input type="number" placeholder="12"
                      value={tripForm.maxGroupSize} onChange={e => setTripForm({ ...tripForm, maxGroupSize: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select value={tripForm.difficulty} onChange={e => setTripForm({ ...tripForm, difficulty: e.target.value })}>
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={tripForm.category} onChange={e => setTripForm({ ...tripForm, category: e.target.value })}>
                    {['adventure','beach','cultural','wildlife','luxury'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={tripForm.featured}
                      onChange={e => setTripForm({ ...tripForm, featured: e.target.checked })} />
                    &nbsp; Featured trip (shown on homepage)
                  </label>
                </div>
                <div className="form-group">
                  <label>Highlights (comma-separated)</label>
                  <input type="text" placeholder="Ubud rice terraces, Tanah Lot temple"
                    value={tripForm.highlights} onChange={e => setTripForm({ ...tripForm, highlights: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Included (comma-separated)</label>
                  <input type="text" placeholder="Hotel stay, Daily breakfast, Guide"
                    value={tripForm.included} onChange={e => setTripForm({ ...tripForm, included: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setTripModal(null)} className="btn btn-outline">Cancel</button>
              <button onClick={handleTripSave} className="btn btn-primary">
                {tripModal.mode === 'create' ? 'Create Trip' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
