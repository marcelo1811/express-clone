import http from "http";

export interface ServerRequest {
  body: string;
}

export default class Request implements ServerRequest {
  body: string;

  constructor(private serverRequest: http.IncomingMessage) {
    this.body = "";

    this.serverRequest.on("data", this.dataListener.bind(this));
  }

  private dataListener(chunk: Buffer): void {
    this.body += chunk.toString();
  }
}
