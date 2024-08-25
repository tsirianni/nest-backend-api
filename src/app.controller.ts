import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RouteDoc } from './common/docs';
import { healthCheck } from './docs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @RouteDoc(healthCheck)
  healthCheck(): string {
    return this.appService.healthCheck();
  }
}
