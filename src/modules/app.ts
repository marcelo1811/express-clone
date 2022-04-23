import http from "http";
import Request, { ServerRequest } from "./request";
import Response, { ServerResponse } from "./response";

enum HTTPMethodOptions {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

interface HTTPMethod {
  [path: string]: (req: ServerRequest, res: ServerResponse) => any;
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
    this.httpListener.GET[path] = callback;
  }

  post(path: string, callback: Callback): void {
    this.httpListener.POST[path] = callback;
  }

  put(path: string, callback: Callback): void {
    this.httpListener.PUT[path] = callback;
  }

  patch(path: string, callback: Callback): void {
    this.httpListener.PATCH[path] = callback;
  }

  delete(path: string, callback: Callback): void {
    this.httpListener.DELETE[path] = callback;
  }

  private requestListener(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): void {
    const callback =
      this.httpListener[req.method as unknown as HTTPMethodOptions][req.url!];

    const response = new Response(res);
    const request = new Request(req);

    if (!callback) {
      response.error();
      return;
    }

    callback(request, response);
  }
}
