import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Chip from '../components/ui/Chip';

const RoomCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'study' | 'build' | 'read' | 'cowork'>('study');
  const [meetLink, setMeetLink] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [monthlyDaysText, setMonthlyDaysText] = useState('');

  const roomTypes = [
    { label: 'Build', category: 'build' as const },
    { label: 'Read', category: 'read' as const },
    { label: 'Co-Work', category: 'cowork' as const },
    { label: 'Study', category: 'study' as const },
  ];

  const timeOptions = [
    { label: 'Morning', value: '09:00' },
    { label: 'Afternoon', value: '13:00' },
    { label: 'Evening', value: '18:00' },
    { label: 'Night', value: '21:00' },
  ];

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    if (timeOfDay && !/^\d{2}:\d{2}$/.test(timeOfDay)) {
      setError('Time of day must be HH:mm');
      return;
    }
    if (startDate && endDate) {
      const s = new Date(startDate + 'T00:00:00');
      const eDate = new Date(endDate + 'T00:00:00');
      if (eDate < s) {
        setError('End date must be on or after start date');
        return;
      }
    }
    // Validate recurrence-specific inputs
    if (recurrenceType === 'weekly' && weeklyDays.length === 0) {
      setError('Select at least one weekday for weekly recurrence');
      return;
    }
    if (recurrenceType === 'monthly') {
      const parsed = monthlyDaysText
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
        .map((t) => parseInt(t, 10))
        .filter((n) => Number.isInteger(n) && n >= 1 && n <= 31);
      if (parsed.length === 0) {
        setError('Enter one or more days of month (1–31)');
        return;
      }
    }
    setLoading(true);
    try {
      await api.post('/rooms', {
        name,
        description,
        category,
        meet_link: meetLink,
        recurrence_type: recurrenceType,
        recurrence_days:
          recurrenceType === 'daily'
            ? undefined
            : recurrenceType === 'weekly'
            ? weeklyDays
            : monthlyDaysText
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0)
                .map((t) => parseInt(t, 10))
                .filter((n) => Number.isInteger(n) && n >= 1 && n <= 31),
        time_of_day: timeOfDay || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        image_url: imageUrl || undefined,
      });
      alert('Room created');
      navigate('/me/rooms');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const selectedTypeLabel = useMemo(() => {
    const t = roomTypes.find((t) => t.category === category);
    return t?.label || 'Study';
  }, [category]);

  return (
    <div className="create-wrap">
      <div className="dash-head" style={{ marginBottom: 12 }}>
        <h1 className="heading-xl">Create a New Room</h1>
        <p className="subtle">Fill in the details below to set up your new focus space.</p>
      </div>
      <div className="create-grid">
        <Card className="create-form">
          {error && <p className="error" style={{ marginBottom: 8 }}>{error}</p>}
          <form onSubmit={onSubmit} className="form-stack">
            <Input
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              label="Room Name"
              placeholder="e.g., Morning Coding Session"
              required
            />
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontWeight: 600 }}>Description</span>
              <textarea
                className="input"
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
                placeholder="Describe the room's vibe, goals, or any rules."
                rows={4}
              />
            </label>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Room Type</div>
              <div className="chipset">
                {roomTypes.map((t) => {
                  const active = category === t.category;
                  return (
                    <button
                      key={t.label}
                      type="button"
                      className={`chip-option ${active ? 'active' : ''}`}
                      onClick={() => setCategory(t.category)}
                    >{t.label}</button>
                  );
                })}
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Recurrence</div>
              <div className="chipset" style={{ marginBottom: 8 }}>
                {['daily','weekly','monthly'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`chip-option ${recurrenceType === t ? 'active' : ''}`}
                    onClick={() => setRecurrenceType(t as any)}
                  >{t[0].toUpperCase() + t.slice(1)}</button>
                ))}
              </div>
              {recurrenceType === 'weekly' && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[0,1,2,3,4,5,6].map((d) => {
                    const labels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                    const active = weeklyDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        className={`chip-option ${active ? 'active' : ''}`}
                        onClick={() => {
                          setWeeklyDays((prev) => {
                            const has = prev.includes(d);
                            return has ? prev.filter((x) => x !== d) : [...prev, d].sort((a,b)=>a-b);
                          });
                        }}
                      >{labels[d]}</button>
                    );
                  })}
                </div>
              )}
              {recurrenceType === 'monthly' && (
                <Input
                  value={monthlyDaysText}
                  onChange={(e: any) => setMonthlyDaysText(e.target.value)}
                  label="Monthly Days (comma-separated 1–31)"
                  placeholder="e.g., 1,15,30"
                />
              )}
            </div>

            <div className="field-row">
              <div style={{ flex: 1 }}>
                <Input
                  value={meetLink}
                  onChange={(e: any) => setMeetLink(e.target.value)}
                  label="Google Meet Link"
                  placeholder="https://meet.google.com/..."
                />
                <small style={{ color: 'var(--text-muted)' }}>Paste your Google Meet link here.</small>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Time of Day</div>
                <div className="chipset">
                  {timeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`chip-option ${timeOfDay === opt.value ? 'active' : ''}`}
                      onClick={() => setTimeOfDay(opt.value)}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  value={startDate}
                  onChange={(e: any) => setStartDate(e.target.value)}
                  label="Start Date"
                  type="date"
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  value={endDate}
                  onChange={(e: any) => setEndDate(e.target.value)}
                  label="End Date"
                  type="date"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </div>

            <Input
              value={imageUrl}
              onChange={(e: any) => setImageUrl(e.target.value)}
              label="Image URL"
              placeholder="https://... (optional)"
            />

            <Button type="submit" variant="primary" className="btn-block" disabled={loading}>{loading ? 'Submitting…' : 'Create Room'}</Button>
          </form>
        </Card>

        <Card className="preview-card">
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Room Preview</div>
          <div className="preview-image">
            {imageUrl ? (
              <img src={imageUrl} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
            ) : (
              'Room Image'
            )}
          </div>
          <div className="preview-title">{name || 'Morning Coding Session'}</div>
          <p className="subtle" style={{ marginTop: 6 }}>
            {description || 'A quiet space for developers to focus on their projects. Let\'s code and stay productive together!'}
          </p>
          <div className="preview-tags">
            <Chip label={selectedTypeLabel} variant={category} />
            <Chip label={(timeOptions.find(t => t.value === timeOfDay)?.label) || 'Morning'} variant="study" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9999, background: '#eee' }} />
            <small className="subtle">Created by You</small>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RoomCreate;
