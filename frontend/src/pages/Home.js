import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TripCard from '../components/TripCard';
import { getTrips, seedTrips } from '../utils/api';
import './Home.css';

const categories = [
  { id: 'beach', label: '🏖 Beach', },
  { id: 'adventure', label: '🏔 Adventure' },
  { id: 'cultural', label: '🏛 Cultural' },
  { id: 'wildlife', label: '🐘 Wildlife' },
  { id: 'luxury', label: '💎 Luxury' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const res = await getTrips({ featured: true });
      setFeatured(res.data);
    } catch {
      // If no trips, seed them
      try {
        await seedTrips();
        const res = await getTrips({ featured: true });
        setFeatured(res.data);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-tagline">✈️ Your next adventure awaits</p>
          <h1>Discover the World,<br />One Trip at a Time</h1>
          <p className="hero-sub">Handcrafted travel experiences across India and beyond. Book with confidence.</p>
          <div className="hero-actions">
            <Link to="/trips" className="btn btn-accent">Explore All Trips</Link>
            <Link to="/trips?category=adventure" className="btn btn-outline-white">Adventure Tours</Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <h2>Browse by Category</h2>
          <div className="cat-grid">
            {categories.map(c => (
              <Link key={c.id} to={`/trips?category=${c.id}`} className="cat-card">
                <span>{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Trips</h2>
            <Link to="/trips" className="btn btn-outline">See All</Link>
          </div>
          {loading ? (
            <div className="loading-screen">Loading trips...</div>
          ) : (
            <div className="trips-grid">
              {featured.map(trip => <TripCard key={trip._id} trip={trip} />)}
            </div>
          )}
        </div>
      </section>

      {/* Why Us */}
      <section className="why-us">
        <div className="container">
          <h2>Why Choose WanderQuest?</h2>
          <div className="why-grid">
            {[
              { icon: '🛡', title: 'Safe & Trusted', desc: '10,000+ happy travelers, verified guides' },
              { icon: '💰', title: 'Best Price', desc: 'Price match guarantee, no hidden charges' },
              { icon: '📞', title: '24/7 Support', desc: 'We\'re always here when you need us' },
              { icon: '🎯', title: 'Curated Picks', desc: 'Every trip handpicked by travel experts' },
            ].map(w => (
              <div key={w.title} className="why-card">
                <span className="why-icon">{w.icon}</span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
