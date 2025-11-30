import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`password_hash\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`idx_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create rooms table
    await queryRunner.query(`
      CREATE TABLE \`rooms\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`description\` text NULL,
        \`category\` enum ('study', 'build', 'focus', 'other') NOT NULL,
        \`meet_link\` varchar(255) NOT NULL,
        \`recurrence_type\` enum ('daily', 'weekly') NOT NULL,
        \`recurrence_days\` text NULL,
        \`time_of_day\` varchar(5) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`creatorId\` int NULL,
        INDEX \`idx_category\` (\`category\`),
        INDEX \`idx_creator_id\` (\`creatorId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Create room_members table
    await queryRunner.query(`
      CREATE TABLE \`room_members\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`userId\` int NULL,
        \`roomId\` int NULL,
        INDEX \`idx_user_id\` (\`userId\`),
        INDEX \`idx_room_id\` (\`roomId\`),
        UNIQUE INDEX \`uq_user_room\` (\`userId\`, \`roomId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE \`rooms\` 
      ADD CONSTRAINT \`FK_rooms_creator\` 
      FOREIGN KEY (\`creatorId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`room_members\` 
      ADD CONSTRAINT \`FK_room_members_user\` 
      FOREIGN KEY (\`userId\`) 
      REFERENCES \`users\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE \`room_members\` 
      ADD CONSTRAINT \`FK_room_members_room\` 
      FOREIGN KEY (\`roomId\`) 
      REFERENCES \`rooms\`(\`id\`) 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE \`room_members\` DROP FOREIGN KEY \`FK_room_members_room\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`room_members\` DROP FOREIGN KEY \`FK_room_members_user\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`rooms\` DROP FOREIGN KEY \`FK_rooms_creator\``,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX \`uq_user_room\` ON \`room_members\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_room_id\` ON \`room_members\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_user_id\` ON \`room_members\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_creator_id\` ON \`rooms\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_category\` ON \`rooms\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_email\` ON \`users\``,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE \`room_members\``);
    await queryRunner.query(`DROP TABLE \`rooms\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
