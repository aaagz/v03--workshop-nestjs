import { Controller, Post } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';

@Controller()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post('down')
  enableMaintenanceMode() {
    this.maintenanceService.enable();
    return { message: 'Maintenance mode enabled' };
  }

  @Post('up')
  disableMaintenanceMode() {
    this.maintenanceService.disable();
    return { message: 'Maintenance mode disabled' };
  }
}
