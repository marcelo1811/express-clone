import http from "http";
import { extractSubPathsFromRoute } from "../utils/extractSubPathsFromRoute";
import Request, { ServerRequest } from "./request";
import Response, { ServerResponse } from "./response";

enum HTTPMethodTypes {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

type RequestListenerParameters = {
  routeParameters: RouteParameter[];
};

export interface RequestListener {
  callback: (req: ServerRequest, res: ServerResponse) => any;
  path: string;
  parameters: RequestListenerParameters;
}

interface HTTPMethod {
  [path: string]: RequestListener;
}

interface RouteParameter {
  name: string;
  index: number;
}

type HTTPListener = {
  [key in HTTPMethodTypes]: HTTPMethod;
};

type Callback = (req: ServerRequest, res: ServerResponse) => void;

interface ServerApp {
  listen(port: number, callback?: () => void): void;
  get(path: string, callback: Callback): void;
  post(path: string, callback: Callback): void;
  put(path: string, callback: Callback): void;
  patch(path: string, callback: Callback): void;
  delete(path: string, callback: Callback): void;
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
    this.addRoute(HTTPMethodTypes.GET, path, callback);
  }

  post(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodTypes.POST, path, callback);
  }

  put(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodTypes.PUT, path, callback);
  }

  patch(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodTypes.PATCH, path, callback);
  }

  delete(path: string, callback: Callback): void {
    this.addRoute(HTTPMethodTypes.DELETE, path, callback);
  }

  private requestListener(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    const response = new Response(res);

    const requestData = this.findListenerByRoute(
      req.method as HTTPMethodTypes,
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

  private extractRouteParametersFromPath(fullPath: string): RouteParameter[] {
    const [path] = fullPath.split("?");
    const subPaths = extractSubPathsFromRoute(path);

    const parameters = subPaths.reduce(
      (acc: RouteParameter[], subPath: string, index: number) => {
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
    method: HTTPMethodTypes,
    path: string,
    callback: Callback
  ): void {
    const pathRegex = this.transformPathToRegex(path);

    this.httpListener[method][pathRegex] = {
      callback,
      path,
      parameters: {
        routeParameters: this.extractRouteParametersFromPath(path),
      },
    };
  }

  private findListenerByRoute(
    method: HTTPMethodTypes,
    url: string
  ): RequestListener {
    const methodPaths = this.httpListener[method];

    const foundPath = Object.keys(methodPaths).find((path) => {
      const pathRegex = new RegExp(path);
      return pathRegex.test(url);
    });

    return methodPaths[foundPath!];
  }
}
