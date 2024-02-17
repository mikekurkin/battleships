import { WebSocketServer } from 'ws';
import { commands } from './interface';
import { SocketCommand } from './types';

export const wsServer = {
  start(port: number) {
    const wss = new WebSocketServer({ port });
    wss.on('connection', (ws) => {
      ws.on('error', console.error);

      ws.on('message', (data) => {
        const request: SocketCommand = JSON.parse(data.toString());
        const handler = commands[request.type];
        if (handler) {
          const response = handler(request.data);
          ws.send(JSON.stringify(response));
        }
      });
    });
  },
};
