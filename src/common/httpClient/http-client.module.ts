import { Global, Module } from '@nestjs/common';

import { HttpClientFactory } from './http-client.factory';

@Global()
@Module({
  providers: [HttpClientFactory],
  exports: [HttpClientFactory],
})
export class HttpClientModule {}
