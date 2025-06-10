import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const isMaintenance = this.configService.get<string>('MAINTENANCE_MODE') === 'true';

    if (isMaintenance && req.path !== '/status') {
      throw new ServiceUnavailableException('The service is currently in maintenance mode.');
    }

    next();
  }
}
