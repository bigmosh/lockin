import { User } from './user.entity';
import { Room, RoomCategory, RecurrenceType } from './room.entity';
import { RoomMember } from './room-member.entity';

describe('Entity Definitions', () => {
  describe('User Entity', () => {
    it('should create a user instance with all required fields', () => {
      const user = new User();
      user.id = 1;
      user.name = 'Test User';
      user.email = 'test@example.com';
      user.passwordHash = 'hashed_password';
      user.createdAt = new Date();

      expect(user.id).toBe(1);
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashed_password');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should have relationships defined', () => {
      const user = new User();
      expect(user.rooms).toBeUndefined();
      expect(user.memberships).toBeUndefined();
    });
  });

  describe('Room Entity', () => {
    it('should create a room instance with all required fields', () => {
      const room = new Room();
      room.id = 1;
      room.name = 'Study Room';
      room.description = 'A room for studying';
      room.category = RoomCategory.STUDY;
      room.meetLink = 'https://meet.google.com/abc-defg-hij';
      room.recurrenceType = RecurrenceType.WEEKLY;
      room.recurrenceDays = [1, 3, 5]; // Mon, Wed, Fri
      room.timeOfDay = '14:00';
      room.createdAt = new Date();

      expect(room.id).toBe(1);
      expect(room.name).toBe('Study Room');
      expect(room.description).toBe('A room for studying');
      expect(room.category).toBe(RoomCategory.STUDY);
      expect(room.meetLink).toBe('https://meet.google.com/abc-defg-hij');
      expect(room.recurrenceType).toBe(RecurrenceType.WEEKLY);
      expect(room.recurrenceDays).toEqual([1, 3, 5]);
      expect(room.timeOfDay).toBe('14:00');
      expect(room.createdAt).toBeInstanceOf(Date);
    });

    it('should support daily recurrence without recurrence days', () => {
      const room = new Room();
      room.recurrenceType = RecurrenceType.DAILY;
      room.recurrenceDays = undefined;

      expect(room.recurrenceType).toBe(RecurrenceType.DAILY);
      expect(room.recurrenceDays).toBeUndefined();
    });

    it('should have all category options', () => {
      expect(RoomCategory.STUDY).toBe('study');
      expect(RoomCategory.BUILD).toBe('build');
      expect(RoomCategory.FOCUS).toBe('focus');
      expect(RoomCategory.OTHER).toBe('other');
    });

    it('should have all recurrence type options', () => {
      expect(RecurrenceType.DAILY).toBe('daily');
      expect(RecurrenceType.WEEKLY).toBe('weekly');
      expect(RecurrenceType.MONTHLY).toBe('monthly');
    });
  });

  describe('RoomMember Entity', () => {
    it('should create a room member instance with all required fields', () => {
      const member = new RoomMember();
      member.id = 1;
      member.joinedAt = new Date();

      expect(member.id).toBe(1);
      expect(member.joinedAt).toBeInstanceOf(Date);
    });

    it('should have relationships defined', () => {
      const member = new RoomMember();
      expect(member.user).toBeUndefined();
      expect(member.room).toBeUndefined();
    });
  });
});
