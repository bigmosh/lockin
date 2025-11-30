import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const detail = await api.get(`/rooms/${id}`);
        setRoom(detail.data);
        const upcoming = await api.get('/me/upcoming-events');
        const filtered = (upcoming.data || []).filter((e: any) => `${e.room_id}` === `${id}`);
        setEvents(filtered);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load room');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>Loading room...</p>;
  if (error) return <p style={{ color: 'salmon' }}>{error}</p>;
  if (!room) return <p>Room not found.</p>;

  return (
    <div className="dashboard">
      <div className="dash-head">
        <h1 className="heading-xl">{room.name}</h1>
        <p className="subtle">Created by {room.creator?.name || '—'}</p>
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          {room.image_url && (
            <Card>
              <div className="preview-image" style={{ height: 220 }}>
                <img src={room.image_url} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
              </div>
            </Card>
          )}
          <Card>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="preview-tags">
                <Chip label={(room.category || 'study').toUpperCase()} variant={room.category || 'study'} />
                <Chip label={`Time: ${room.time_of_day || '—'}`} variant="study" />
              </div>
              <p className="subtle" style={{ marginTop: 6 }}>{room.description || '—'}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {room.meet_link && (
                  <a href={room.meet_link} target="_blank" rel="noreferrer noopener" className="btn btn-primary">Open Meet</a>
                )}
                <Button variant="secondary" onClick={() => alert('Member actions coming soon')}>More Actions</Button>
              </div>
            </div>
          </Card>

          <Card>
            <div className="side-title" style={{ marginBottom: 8 }}>Upcoming Schedule</div>
            <div className="list">
              {events.length === 0 ? (
                <p className="subtle">No upcoming events found.</p>
              ) : (
                events.slice(0, 14).map((e: any) => (
                  <div key={`${e.room_id}-${e.start_time}`} className="event-item">
                    <div className="event-info">
                      <div className="event-title">{room.name}</div>
                      <div className="event-subtle">Starts: {new Date(e.start_time).toLocaleString()}</div>
                    </div>
                    <div className="event-actions">
                      {room.meet_link && (
                        <button
                          className="btn btn-secondary"
                          onClick={async () => {
                            try {
                              if (!room.is_member && !room.is_creator) {
                                await api.post(`/rooms/${room.id}/join`);
                                setRoom({ ...room, is_member: true });
                              }
                              alert('You have joined the room');
                            } catch (err: any) {
                              alert(err?.response?.data?.message || err?.message || 'Failed to join room');
                            }
                          }}
                        >Join</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        <div className="dash-side">
          <Card>
            <div className="side-title">Room Info</div>
            <div className="side-list">
              <div className="side-item"><span>Recurrence</span><span className="chev">{room.recurrence_type || '—'}</span></div>
              {room.recurrence_type === 'weekly' && (
                <div className="side-item"><span>Days</span><span className="chev">{(room.recurrence_days || []).map((d: number) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ') || '—'}</span></div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
