import http from "http";

export interface ServerResponse {
  status(code: number): ServerResponse;
  send(data: string | Object): void;
}

type ResponseData = Object | string;

class Response implements ServerResponse {
  private responseStatus: number;
  private responseData: ResponseData;

  constructor(
    private serverResponse: http.ServerResponse
  ) {
    this.responseStatus = 200;
    this.responseData = {};
  }
  
  status(code: number): ServerResponse {
    this.responseStatus = code;
    return this;
  }

  send(data: ResponseData): void {
    let responseData = data;
    if (typeof data === 'object') {
      responseData = JSON.stringify(data)
    }

    this.responseData = responseData;
    this.end();
  }

  private end(): void {
    this.serverResponse.writeHead(this.responseStatus, { 'Content-Type': 'application/json' });
    this.serverResponse.end(this.responseData);
  }
}

export default Response;