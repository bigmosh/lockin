import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getToken } from '../api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Chip from '../components/ui/Chip';

type PublicRoom = {
  id: number;
  name: string;
  description: string;
  category: string;
  creator: { id: number; name: string };
  next_meeting?: string | Date | null;
  image_url?: string;
};

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'start' | 'name'>('start');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    api
      .get<PublicRoom[]>('/rooms/public')
      .then((res) => setRooms(res.data))
      .catch((err) => setError(err?.response?.data?.message || err.message || 'Failed to load rooms'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo<string[]>(() => {
    const set = new Set<string>();
    rooms.forEach(r => { if (r.category) set.add(r.category); });
    return ['all', ...Array.from(set)];
  }, [rooms]);

  const filtered = useMemo<PublicRoom[]>(() => {
    const text = q.trim().toLowerCase();
    let list = rooms.filter(r => {
      const matchesText = text ? (
        r.name.toLowerCase().includes(text) ||
        (r.description || '').toLowerCase().includes(text) ||
        (r.creator?.name || '').toLowerCase().includes(text)
      ) : true;
      const matchesCat = category === 'all' ? true : r.category === category;
      return matchesText && matchesCat;
    });
    list = list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const an = a.next_meeting ? new Date(a.next_meeting as any).getTime() : Infinity;
      const bn = b.next_meeting ? new Date(b.next_meeting as any).getTime() : Infinity;
      return an - bn;
    });
    return list;
  }, [rooms, q, category, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => { setPage(1); }, [q, category, sortBy]);

  const join = async (roomId: number) => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/rooms/${roomId}/join`);
      alert('You have joined the room');
      navigate(`/rooms/${roomId}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to join room');
    }
  };

  const startsLabel = (next?: string | Date | null) => {
    if (!next) return 'No upcoming meeting';
    const t = new Date(next as any).getTime();
    const diffMs = t - Date.now();
    if (diffMs <= 0) return 'Live';
    const mins = Math.round(diffMs / 60000);
    if (mins < 60) return `Starts in ${mins}m`;
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return `Starts in ${hours}h ${rem}m`;
  };

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p style={{ color: 'salmon' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, margin: 0 }}>LockIN Rooms</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Find your community and get focused. Join a session below.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ width: 320 }}>
          <Input placeholder="Search for rooms..." value={q} onChange={(e: any) => setQ(e.target.value)} />
        </div>
        <Button variant="ghost" onClick={() => setCategory('all')}>Filter</Button>
        <Button variant="ghost" onClick={() => setSortBy(s => (s === 'start' ? 'name' : 'start'))}>Sort By</Button>
      </div>

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {categories.map((c) => (
          <button
            key={c}
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
            onClick={() => setCategory(c)}
          >{c === 'all' ? 'All' : c}</button>
        ))}
      </div>

      {/* Grid of room cards */}
      {filtered.length === 0 ? (
        <p>No rooms match your filters.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {paged.map((r) => (
            <Card key={r.id} className="room-card" raiseOnHover>
              <div className="room-media">
                {r.image_url ? (
                  <img src={r.image_url} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%' }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{r.name}</div>
                <Chip label={r.category} variant="study" />
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 8 }}>by {r.creator?.name || 'Unknown'}</div>
              <div style={{ fontSize: 13, marginBottom: 8 }}>{r.description}</div>
              <div className="room-footer">
                <small style={{ color: 'var(--accent)' }}>{startsLabel(r.next_meeting)}</small>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button
                    variant="primary"
                    className={`btn-flat ${startsLabel(r.next_meeting) === 'Live' ? '' : 'soft'}`}
                    onClick={() => join(r.id)}
                  >{startsLabel(r.next_meeting) === 'Live' ? 'Join Live' : 'Join Room'}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {Array.from({ length: pageCount }).map((_, i) => {
            const n = i + 1;
            const active = n === page;
            return (
              <button key={n} className="btn btn-secondary" style={{ background: active ? 'var(--primary)' : 'transparent', color: active ? '#fff' : 'var(--primary)' }} onClick={() => setPage(n)}>
                {n}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Rooms;
