import React, { useEffect, useState } from 'react';
import { api } from '../api';

type MyRoom = {
  id: number;
  name: string;
  description?: string;
  category?: string;
  timeOfDay?: string;
};

const MyRooms: React.FC = () => {
  const [rooms, setRooms] = useState<MyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<MyRoom[]>('/me/rooms')
      .then((res) => setRooms(res.data))
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load my rooms'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading my rooms...</p>;
  if (error) return <p style={{ color: 'salmon' }}>{error}</p>;

  return (
    <div>
      <h2>My Rooms</h2>
      {rooms.length === 0 ? (
        <p>You have no rooms yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rooms.map((r) => (
            <li key={r.id} style={{ marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 8 }}>
              <div style={{ fontWeight: 600 }}>{r.name}</div>
              {r.description && <div style={{ margin: '0.25rem 0' }}>{r.description}</div>}
              {r.category && <div>Category: {r.category}</div>}
              {r.timeOfDay && <div>Time: {r.timeOfDay}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyRooms;