import { ListenerData, ParameterFromPath } from "./app";
import http from "http";
import { extractSubtPaths } from "../utils/extractSubPaths";

interface RouteParameters {
  [key: string]: string;
}
export interface ServerRequest {
  body: any;
  readDataStream: () => Promise<unknown>;
  params: RouteParameters;
}

enum ParameterTypes {
  PATH_PARAMETERS = "fromPath",
}

export type Parameters = {
  [key in ParameterTypes]: ParameterFromPath[];
};
export default class Request implements ServerRequest {
  body: any;
  params: RouteParameters = {};

  constructor(
    private serverRequest: http.IncomingMessage,
    private listenerData: ListenerData
  ) {
    this.body = "";
    this.serverRequest.on("data", this.dataListener.bind(this));
    this.extractRouteParameters();
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

  private extractRouteParameters(): void {
    const subPaths = extractSubtPaths(this.serverRequest.url!);
    const pathParameters = this.listenerData.parameters.fromPath;

    pathParameters.forEach((parameter) => {
      this.params[parameter.name] = subPaths[parameter.index];
    });
  }
}
