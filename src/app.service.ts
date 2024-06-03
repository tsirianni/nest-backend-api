import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}

  getHello(): string {
    throw new NotFoundException();
    return 'Hello World!!';
  }
}
