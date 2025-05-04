import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { APIS } from './enums';

@Injectable()
export class HttpClientFactory {
  generateHttpClient(domain: APIS, timeout = 6000, customHeaders = { 'Content-Type': 'application/json' }): AxiosInstance {
    return axios.create({
      baseURL: domain,
      timeout,
      headers: customHeaders,
    });
  }
}
