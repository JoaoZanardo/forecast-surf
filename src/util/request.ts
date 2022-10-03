import axios, { AxiosRequestConfig } from 'axios';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface RequestConfig extends AxiosRequestConfig {}

export class Request {
  constructor(private request = axios) {}

  // get<T>(url: string, config: RequestConfig = {}): Promise<Axios> {}
}
