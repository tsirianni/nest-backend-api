import { Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';

import { GetShapeDetailsReturn, ListShapesReturn } from './pokemon.types';
import { HttpClientFactory } from '../http-client.factory';
import { ROUTES } from './enums';
import { APIS } from '../enums';

@Injectable()
export class PokemonService {
  private readonly httpClient: AxiosInstance;

  constructor(private readonly httpClientFactory: HttpClientFactory) {
    this.httpClient = this.httpClientFactory.generateHttpClient(APIS.POKEMON);
  }

  /* Error treatment can be applied to the requests below as needed */
  public async listShapes() {
    const response = await this.httpClient.get(ROUTES.LIST_SHAPES);

    return response.data as ListShapesReturn;
  }

  public async getShapeDetails(id: string) {
    const route = ROUTES.GET_SHAPE_DETAILS.replace(':id', id);
    const response = await this.httpClient.get(route);

    return response.data as GetShapeDetailsReturn;
  }
}
