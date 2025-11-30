import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMonthlyAndImageUrl1700000000001 implements MigrationInterface {
  name = 'AddMonthlyAndImageUrl1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `rooms` MODIFY `recurrence_type` enum ('daily','weekly','monthly') NOT NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `rooms` ADD COLUMN `image_url` varchar(512) NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `rooms` ADD COLUMN `start_date` date NULL"
    );
    await queryRunner.query(
      "ALTER TABLE `rooms` ADD COLUMN `end_date` date NULL"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `rooms` DROP COLUMN `end_date`"
    );
    await queryRunner.query(
      "ALTER TABLE `rooms` DROP COLUMN `start_date`"
    );
    await queryRunner.query(
      "ALTER TABLE `rooms` DROP COLUMN `image_url`"
    );
    await queryRunner.query(
      "ALTER TABLE `rooms` MODIFY `recurrence_type` enum ('daily','weekly') NOT NULL"
    );
  }
}
