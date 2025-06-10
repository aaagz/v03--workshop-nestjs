import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MaintenanceModule } from './maintenance.module';
import { MaintenanceGuard } from './maintenance.guard';
import { APP_GUARD } from '@nestjs/core';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [MaintenanceModule, TodosModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
  ],
})
export class AppModule {}

