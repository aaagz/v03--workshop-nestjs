import { Injectable, CanActivate, ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const path = request.path;

    // Allow /up and /down routes even in maintenance mode
    if (path === '/up' || path === '/down') {
      return true;
    }

    if (this.maintenanceService.getStatus()) {
      throw new ServiceUnavailableException('Service is in maintenance mode.');
    }

    return true;
  }
}
