import http from "http";
import { extractSubtPaths } from "../utils/extractSubPaths";
import Request, { Parameters, ServerRequest } from "./request";
import Response, { ServerResponse } from "./response";

enum HTTPMethodOptions {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export interface ListenerData {
  callback: (req: ServerRequest, res: ServerResponse) => any;
  path: string;
  parameters: Parameters;
}

interface HTTPMethod {
  [path: string]: ListenerData;
}

export interface ParameterFromPath {
  name: string;
  index: number;
}

type HTTPListener = {
  [key in HTTPMethodOptions]: HTTPMethod;
};

type Callback = (req: ServerRequest, res: ServerResponse) => void;

interface ServerApp {
  listen(port: number, callback?: () => void): void;
  get(path: string, callback: Callback): void;
}

export default class App implements ServerApp {
  private port: number;
  private server: http.Server;
  private httpListener: HTTPListener;

  constructor() {
    this.port = Number(process.env.PORT) || 3000;
    this.httpListener = {
      GET: {},
      POST: {},
      PUT: {},
      DELETE: {},
      PATCH: {},
    };
    this.server = http.createServer(this.requestListener.bind(this));
  }

  listen(port: number, callback?: () => void): void {
    this.port = port ?? this.port;
    this.server.listen(this.port, callback);
  }

  get(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodOptions.GET, path, callback);
  }

  post(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodOptions.POST, path, callback);
  }

  put(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodOptions.PUT, path, callback);
  }

  patch(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodOptions.PATCH, path, callback);
  }

  delete(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodOptions.DELETE, path, callback);
  }

  private requestListener(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    const response = new Response(res);

    const requestData = this.findListenerRoute(
      req.method as HTTPMethodOptions,
      req.url!
    );

    if (!requestData) return;
    const requestCallback = requestData.callback;

    if (!requestCallback) {
      response.error();
      return;
    }

    const request = new Request(req, requestData);

    request.readDataStream().then(() => {
      requestCallback(request, response);
      return;
    });
  }

  private extractRouteParametersFromPath(
    fullPath: string
  ): ParameterFromPath[] {
    const [path] = fullPath.split("?");
    const subPaths = extractSubtPaths(path);

    const parameters = subPaths.reduce(
      (acc: ParameterFromPath[], subPath: string, index: number) => {
        if (subPath.startsWith(":")) {
          const parameterName = subPath.slice(1);
          acc.push({
            name: parameterName,
            index,
          });
        }
        return acc;
      },
      []
    );

    return parameters;
  }

  private transformPathToRegex(path: string): string {
    const parameterRegex = /:\w+/g;
    const pathRegex = path.replace(parameterRegex, "\\w+");

    return "^" + pathRegex + "$";
  }

  private addRoute(
    method: HTTPMethodOptions,
    path: string,
    callback: Callback
  ): void {
    const pathRegex = this.transformPathToRegex(path);

    this.httpListener[method][pathRegex] = {
      callback,
      path,
      parameters: {
        fromPath: this.extractRouteParametersFromPath(path),
      },
    };
  }

  private findListenerRoute(
    method: HTTPMethodOptions,
    url: string
  ): ListenerData {
    const methodPaths = this.httpListener[method];

    const foundPath = Object.keys(methodPaths).find((path) => {
      const pathRegex = new RegExp(path);
      return pathRegex.test(url);
    });

    return methodPaths[foundPath!];
  }
}
