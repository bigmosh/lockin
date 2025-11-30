import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  getHello(): string {
    return 'Lockin Platform API';
  }

  async checkDatabaseConnection(): Promise<string> {
    try {
      await this.connection.query('SELECT 1');
      return 'connected';
    } catch (error) {
      return 'disconnected';
    }
  }
}
