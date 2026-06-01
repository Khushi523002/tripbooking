import React from 'react';
import { Link } from 'react-router-dom';
import './TripCard.css';

export default function TripCard({ trip }) {
  return (
    <div className="trip-card">
      <div className="card-image">
        <img src={trip.image} alt={trip.title} />
        <span className={`badge badge-${trip.difficulty} card-badge`}>{trip.difficulty}</span>
        <span className="badge badge-category card-category">{trip.category}</span>
      </div>
      <div className="card-body">
        <div className="card-meta">
          <span>📍 {trip.destination}</span>
          <span>⏱ {trip.duration} days</span>
        </div>
        <h3>{trip.title}</h3>
        <p className="card-desc">{trip.description.slice(0, 90)}...</p>
        <div className="card-footer">
          <div className="price-block">
            <span className="price">₹{trip.price.toLocaleString()}</span>
            <span className="per-person">/ person</span>
          </div>
          <div className="rating">⭐ {trip.rating} <span>({trip.reviewCount})</span></div>
        </div>
        <Link to={`/trips/${trip._id}`} className="btn btn-primary card-btn">View Details</Link>
      </div>
    </div>
  );
}
