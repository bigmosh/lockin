import { Injectable } from '@nestjs/common';
import { Room, RecurrenceType } from '../entities/room.entity';

export interface UpcomingEvent {
  room_id: number;
  room_name: string;
  category: string;
  start_time: Date;
  meet_link: string;
}

@Injectable()
export class ScheduleService {
  computeNextMeeting(room: Room, fromTime: Date = new Date()): Date | null {
    const [hours, minutes] = room.timeOfDay.split(':').map((v) => parseInt(v, 10));
    // Respect start_date and end_date range
    const base = new Date(fromTime);
    base.setSeconds(0, 0);

    const startDate = room.startDate ? new Date(room.startDate + 'T00:00:00Z') : null;
    const endDate = room.endDate ? new Date(room.endDate + 'T23:59:59Z') : null;
    // If base is before startDate, move base to startDate
    if (startDate && base < startDate) {
      base.setTime(startDate.getTime());
    }

    if (room.recurrenceType === RecurrenceType.DAILY) {
      const candidate = new Date(base);
      candidate.setHours(hours, minutes, 0, 0);
      if ((!endDate || candidate <= endDate) && candidate > base) return candidate;
      candidate.setDate(candidate.getDate() + 1);
      return endDate && candidate > endDate ? null : candidate;
    }

    if (room.recurrenceType === RecurrenceType.WEEKLY) {
      const days = (room.recurrenceDays || []).slice().sort((a, b) => a - b);
      if (days.length === 0) return null;
      const currentDow = base.getDay();
      for (let i = 0; i < 7; i++) {
        const dow = (currentDow + i) % 7;
        if (days.includes(dow)) {
          const candidate = new Date(base);
          candidate.setDate(base.getDate() + i);
          candidate.setHours(hours, minutes, 0, 0);
          if ((!endDate || candidate <= endDate) && candidate > base) return candidate;
        }
      }
      // If none found in the loop because of time past, pick next available next week
      const nextDow = days[0];
      const daysUntilNext = (7 - currentDow + nextDow) % 7 || 7;
      const candidate = new Date(base);
      candidate.setDate(base.getDate() + daysUntilNext);
      candidate.setHours(hours, minutes, 0, 0);
      if (endDate && candidate > endDate) return null;
      return candidate;
    }

    if (room.recurrenceType === RecurrenceType.MONTHLY) {
      const doms = (room.recurrenceDays || []).slice().sort((a, b) => a - b);
      if (doms.length === 0) return null;
      for (let m = 0; m < 24; m++) {
        const probe = new Date(base);
        probe.setMonth(base.getMonth() + m, 1);
        const y = probe.getFullYear();
        const mo = probe.getMonth();
        for (const dom of doms) {
          const candidate = new Date(y, mo, dom, hours, minutes, 0, 0);
          if (candidate.getMonth() !== mo) continue;
          if ((!endDate || candidate <= endDate) && candidate > base) return candidate;
        }
      }
      return null;
    }

    return null;
  }

  generateUpcomingEvents(rooms: Room[], days = 30, fromTime: Date = new Date()): UpcomingEvent[] {
    const events: UpcomingEvent[] = [];
    const endTime = new Date(fromTime);
    endTime.setDate(endTime.getDate() + days);

    for (const room of rooms) {
      let cursor = this.computeNextMeeting(room, fromTime);
      const hardEnd = (() => {
        const endDate = room.endDate ? new Date(room.endDate + 'T23:59:59Z') : null;
        if (!endDate) return endTime;
        return endDate < endTime ? endDate : endTime;
      })();
      while (cursor && cursor <= endTime) {
        events.push({
          room_id: room.id,
          room_name: room.name,
          category: room.category,
          start_time: new Date(cursor),
          meet_link: room.meetLink,
        });
        // advance cursor to next occurrence
        if (room.recurrenceType === RecurrenceType.DAILY) {
          cursor = new Date(cursor);
          cursor.setDate(cursor.getDate() + 1);
        } else if (room.recurrenceType === RecurrenceType.WEEKLY) {
          const days = (room.recurrenceDays || []).slice().sort((a, b) => a - b);
          const currentDow = (cursor as Date).getDay();
          const nextIndex = days.findIndex((d) => d > currentDow);
          const nextDow = nextIndex !== -1 ? days[nextIndex] : days[0];
          const daysUntilNext = (7 - currentDow + nextDow) % 7 || 7;
          cursor = new Date(cursor);
          (cursor as Date).setDate((cursor as Date).getDate() + daysUntilNext);
        } else if (room.recurrenceType === RecurrenceType.MONTHLY) {
          const doms = (room.recurrenceDays || []).slice().sort((a, b) => a - b);
          const currentDom = (cursor as Date).getDate();
          let nextDom: number | null = null;
          for (const d of doms) {
            if (d > currentDom) { nextDom = d; break; }
          }
          let y = (cursor as Date).getFullYear();
          let mo = (cursor as Date).getMonth();
          if (nextDom === null) { mo += 1; nextDom = doms[0]; }
          let candidate = new Date(y, mo, nextDom as number);
          if (candidate.getMonth() !== mo) {
            let found = false;
            for (let i = 1; i <= 12 && !found; i++) {
              const tryMo = mo + i;
              const tryDate = new Date(y, tryMo, nextDom as number);
              if (tryDate.getMonth() === (new Date(y, tryMo, 1)).getMonth()) {
                candidate = tryDate;
                found = true;
              }
            }
            if (!found) break;
          }
          cursor = candidate;
        } else {
          break;
        }
        (cursor as Date).setHours(parseInt(room.timeOfDay.split(':')[0], 10), parseInt(room.timeOfDay.split(':')[1], 10), 0, 0);
        if (cursor && cursor > hardEnd) break;
      }
    }

    return events.sort((a, b) => a.start_time.getTime() - b.start_time.getTime());
  }
}
