import { Injectable } from '@nestjs/common';

@Injectable()
export class MaintenanceService {
  private isEnabled = false;

  enable(): void {
    this.isEnabled = true;
  }

  disable(): void {
    this.isEnabled = false;
  }

  getStatus(): boolean {
    return this.isEnabled;
  }
}
