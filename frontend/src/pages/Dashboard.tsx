import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse, isAxiosError } from 'axios';
import { api, getToken } from '../api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

type DashboardItem = {
  room_id: number;
  name: string;
  category: string;
  creator: { id: number; name: string };
  meet_link: string;
  time_of_day: string;
  next_meeting: string | Date | null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  type PublicRoom = {
    id: number;
    name: string;
    description?: string;
    category?: string;
    creator?: { id: number; name: string };
    next_meeting?: string | Date | null;
    image_url?: string;
  };
  const [joinable, setJoinable] = useState<PublicRoom[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Not authenticated. Please login and store your token in localStorage as "token".');
      setLoading(false);
      return;
    }
    // Load dashboard rooms (unique per room)
    api
      .get<DashboardItem[]>('/dashboard')
      .then((res: AxiosResponse<DashboardItem[]>) => setItems(res.data))
      .catch((err: unknown) => {
        const msg = isAxiosError(err)
          ? (err.response?.data as any)?.message ?? err.message
          : (err as Error).message;
        setError(msg);
      })
      .finally(() => setLoading(false));

    // Load joinable rooms by excluding my rooms from public rooms
    Promise.all([api.get<PublicRoom[]>('/rooms/public'), api.get<any[]>('/me/rooms')])
      .then(([pubRes, myRes]) => {
        const myIds = new Set<number>((myRes.data || []).map((r: any) => r.id));
        const list = (pubRes.data || []).filter((r) => !myIds.has(r.id));
        setJoinable(list);
      })
      .catch((err: unknown) => {
        // Fail silently for joinable list so dashboard still works
        console.warn('Failed to load joinable rooms', err);
      });
  }, []);

  const myRooms = useMemo(() => {
    const byId = new Map<number, { id: number; name: string }>();
    items.forEach((it) => {
      if (!byId.has(it.room_id)) byId.set(it.room_id, { id: it.room_id, name: it.name });
    });
    return Array.from(byId.values());
  }, [items]);

  if (loading) return <p>Loading your rooms...</p>;
  if (error) return <p style={{ color: 'salmon' }}>{error}</p>;

  return (
    <div className="dashboard">
      <div className="dash-head">
        <h1 className="heading-xl">Welcome back, User!</h1>
        <p className="subtle">Ready to start your next focus session?</p>
      </div>

      <div className="dash-actions">
        <Button variant="primary" onClick={() => navigate('/rooms/new')}>Create a New Room</Button>
        <Button variant="secondary" onClick={() => navigate('/rooms')}>Join a Room</Button>
      </div>

      <div className="dash-search">
        <input className="input" placeholder="Search for rooms or events..." />
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          <Card>
            <div className="list">
              {items.length === 0 ? (
                <p>No rooms found. Join or create a room.</p>
              ) : (
                items.map((it) => (
                  <div key={it.room_id} className="event-item">
                    <div className="event-info">
                      <div className="event-title">{it.name}</div>
                      <div className="event-subtle">Next: {it.next_meeting ? new Date(it.next_meeting).toLocaleString() : '—'}</div>
                    </div>
                    <div className="event-actions" style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" onClick={() => navigate(`/rooms/${it.room_id}`)}>View Details</button>
                      {it.meet_link && (
                        <a href={it.meet_link} target="_blank" rel="noreferrer noopener" className="btn btn-secondary">Open Meet</a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* spacing handled via CSS grid gap on dash-main */}
          {/* Joinable Rooms */}
          <Card>
            <div className="side-title" style={{ marginBottom: 8 }}>Joinable Rooms</div>
            <div className="list">
              {joinable.length === 0 ? (
                <p className="subtle">No rooms available to join right now.</p>
              ) : (
                joinable.slice(0, 6).map((r) => {
                  const img = (r as any).image_url as string | undefined;
                  return (
                    <div key={r.id} className="event-item" style={{ alignItems: 'stretch' }}>
                      {img && (
                        <div className="preview-image" style={{ width: 160, height: 90, marginBottom: 0 }}>
                          <img src={img} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                        </div>
                      )}
                      <div className="event-info">
                        <div className="event-title">{r.name}</div>
                        <div className="event-subtle">{r.description || '—'}</div>
                      </div>
                      <div className="event-actions" style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" onClick={async () => {
                          try {
                            await api.post(`/rooms/${r.id}/join`);
                            alert('You have joined the room');
                            navigate(`/rooms/${r.id}`);
                          } catch (err: any) {
                            alert(err?.response?.data?.message || err?.message || 'Failed to join room');
                          }
                        }}>Join</button>
                        <button className="btn btn-secondary" onClick={() => navigate(`/rooms/${r.id}`)}>Details</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
        <div className="dash-side">
          <Card>
            <div className="side-title">My Rooms</div>
            <div className="side-list">
              {myRooms.length === 0 ? (
                <p className="subtle">No rooms yet.</p>
              ) : (
                myRooms.map((r) => (
                  <button key={r.id} className="side-item" onClick={() => navigate(`/rooms/${r.id}`)} style={{ textAlign: 'left' }}>
                    <span>{r.name}</span>
                    <span className="chev">›</span>
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
