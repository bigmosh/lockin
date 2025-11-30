# Database Migrations

This directory contains TypeORM migrations for the Lockin platform database schema.

## Initial Schema

The initial migration (`1700000000000-InitialSchema.ts`) creates:

### Tables

1. **users**
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `name` (VARCHAR(255), NOT NULL)
   - `email` (VARCHAR(255), NOT NULL, UNIQUE)
   - `password_hash` (VARCHAR(255), NOT NULL)
   - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
   - Index: `idx_email` on `email` (UNIQUE)

2. **rooms**
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `name` (VARCHAR(255), NOT NULL)
   - `description` (TEXT, NULLABLE)
   - `category` (ENUM: 'study', 'build', 'focus', 'other', NOT NULL)
   - `meet_link` (VARCHAR(255), NOT NULL)
   - `recurrence_type` (ENUM: 'daily', 'weekly', NOT NULL)
   - `recurrence_days` (TEXT, NULLABLE) - Stores array of weekday numbers
   - `time_of_day` (VARCHAR(5), NOT NULL) - HH:mm format
   - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
   - `creatorId` (INT, FOREIGN KEY to users.id)
   - Index: `idx_category` on `category`
   - Index: `idx_creator_id` on `creatorId`
   - Foreign Key: `creatorId` REFERENCES `users(id)` ON DELETE CASCADE

3. **room_members**
   - `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
   - `joined_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)
   - `userId` (INT, FOREIGN KEY to users.id)
   - `roomId` (INT, FOREIGN KEY to rooms.id)
   - Index: `idx_user_id` on `userId`
   - Index: `idx_room_id` on `roomId`
   - Unique Index: `uq_user_room` on (`userId`, `roomId`)
   - Foreign Key: `userId` REFERENCES `users(id)` ON DELETE CASCADE
   - Foreign Key: `roomId` REFERENCES `rooms(id)` ON DELETE CASCADE

## Running Migrations

### Run all pending migrations
```bash
npm run migration:run
```

### Revert the last migration
```bash
npm run migration:revert
```

### Generate a new migration (after entity changes)
```bash
npm run migration:generate -- src/migrations/MigrationName
```

## Notes

- The application is currently configured with `synchronize: true` in development, which automatically syncs the schema
- For production, set `synchronize: false` and use migrations
- All foreign keys use `ON DELETE CASCADE` to maintain referential integrity
- Indexes are created on frequently queried columns for performance
