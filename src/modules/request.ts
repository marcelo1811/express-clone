import http from "http";

export interface ServerRequest {
  body: string;
  readDataStream: () => Promise<unknown>;
}

export default class Request implements ServerRequest {
  body: any;

  constructor(private serverRequest: http.IncomingMessage) {
    this.body = "";

    this.serverRequest.on("data", this.dataListener.bind(this));
  }

  private dataListener(chunk: Buffer): void {
    this.body += chunk.toString();
  }

  async readDataStream(): Promise<unknown> {
    const endRequest = new Promise((resolve, reject) => {
      this.serverRequest.on("end", () => {
        const data = JSON.parse(this.body);
        this.body = data;
        resolve(this);
      });
    });
    return await endRequest;
  }
}
