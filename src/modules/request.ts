import { RequestListener } from "./app";
import http from "http";
import { extractSubPathsFromRoute } from "../utils/extractSubPathsFromRoute";

interface Params {
  [key: string]: string;
}
export interface ServerRequest {
  body: any;
  readDataStream: () => Promise<unknown>;
  params: Params;
  query: Params;
}

export default class Request implements ServerRequest {
  body: any;
  params: Params = {};
  query: Params = {};

  constructor(
    private serverRequest: http.IncomingMessage,
    private requestListener: RequestListener
  ) {
    this.body = "";
    this.serverRequest.on("data", this.dataListener.bind(this));
    this.extractRequestParameters();
  }

  async readDataStream(): Promise<unknown> {
    const endRequest = new Promise((resolve, reject) => {
      this.serverRequest.on("end", () => {
        const data = JSON.parse(this.body || "{}");
        this.body = data;
        resolve(this);
      });
    });
    return await endRequest;
  }

  private dataListener(chunk: Buffer): void {
    this.body += chunk.toString();
  }

  private extractRequestParameters(): void {
    this.extractRouteParameters();
    this.extractQueryParameters();
  }

  private extractRouteParameters(): void {
    const subPaths = extractSubPathsFromRoute(this.serverRequest.url!);
    const routeParameters = this.requestListener.parameters.routeParameters;

    routeParameters.forEach((parameter) => {
      this.params[parameter.name] = subPaths[parameter.index];
    });
  }

  private extractQueryParameters(): void {
    const query = this.serverRequest.url!.split("?")[1];
    if (!query) return;

    const queryParameters = query.split("&");

    queryParameters.forEach((parameter) => {
      const [name, value] = parameter.split("=");
      this.query[name] = value;
    });
  }
}
