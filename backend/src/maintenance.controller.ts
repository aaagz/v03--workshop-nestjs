import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class MaintenanceController {
  constructor(private readonly configService: ConfigService) {}

  @Get('status')
  getStatus() {
    const isMaintenance =
      this.configService.get<string>('MAINTENANCE_MODE') === 'true';
    return {
      status: isMaintenance ? 'maintenance' : 'ok',
    };
  }
}

