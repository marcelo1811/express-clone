import http from 'http';
import Response, { ServerResponse } from './response';

enum HTTPMethodOptions {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
};

interface HTTPMethod {
  [path: string]: (req: http.IncomingMessage, res: ServerResponse) => any;
}

type HTTPListener = {
  [key in HTTPMethodOptions]: HTTPMethod;
}

export class App {
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
    };
    this.server = http.createServer(this.doOnRequest.bind(this));
  }

  doOnRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const callback = this.httpListener[req.method as unknown as HTTPMethodOptions][req.url!];

    if (!callback) return;

    const response = new Response(res);
    callback(req, response);
  };

  listen(port: number, cb?: () => void) {
    this.port = port ?? this.port;
    this.server.listen(this.port, cb);    
  }

  get(path: string, cb: (req: http.IncomingMessage, res: ServerResponse) => void) {
    this.httpListener.GET[path] = cb;
  }
}