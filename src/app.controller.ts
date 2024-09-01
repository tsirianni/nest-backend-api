import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { RouteDoc } from './common/docs';
import { healthCheck } from './docs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  @RouteDoc(healthCheck)
  healthCheck(): string {
    return this.appService.healthCheck();
  }
}
