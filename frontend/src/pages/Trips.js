import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import TripCard from '../components/TripCard';
import { getTrips } from '../utils/api';
import './Trips.css';

const CATEGORIES = ['all', 'adventure', 'beach', 'cultural', 'wildlife', 'luxury'];

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchTrips();
  }, [category, maxPrice]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (maxPrice) params.maxPrice = maxPrice;
      if (search) params.search = search;
      const res = await getTrips(params);
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  return (
    <div className="trips-page">
      <div className="trips-hero">
        <h1>Explore All Trips</h1>
        <p>Find your perfect adventure from our curated collection</p>
      </div>

      <div className="container trips-layout">
        {/* Filters Sidebar */}
        <aside className="filters">
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Search</label>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Destination or trip name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </form>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <div className="filter-options">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  className={`filter-btn ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Max Budget (₹)</label>
            <select value={maxPrice} onChange={e => setMaxPrice(e.target.value)}>
              <option value="">Any</option>
              <option value="20000">Up to ₹20,000</option>
              <option value="50000">Up to ₹50,000</option>
              <option value="100000">Up to ₹1,00,000</option>
              <option value="200000">Up to ₹2,00,000</option>
            </select>
          </div>
        </aside>

        {/* Results */}
        <main className="results">
          <div className="results-header">
            <span>{trips.length} trips found</span>
          </div>

          {loading ? (
            <div className="loading-screen">Searching trips...</div>
          ) : trips.length === 0 ? (
            <div className="no-results">
              <span>😕</span>
              <p>No trips found. Try different filters.</p>
            </div>
          ) : (
            <div className="trips-grid">
              {trips.map(trip => <TripCard key={trip._id} trip={trip} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
