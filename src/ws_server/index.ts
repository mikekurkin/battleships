import { WebSocketServer } from 'ws';
import { commands } from './commands';
import { SocketCommand } from './types';
import { users } from './users';

export const wsServer = {
  start(port: number) {
    const wss = new WebSocketServer({ port });
    wss.on('connection', (ws) => {
      ws.on('error', console.error);

      ws.on('message', (data) => {
        const request: SocketCommand = JSON.parse(data.toString());
        const handler = commands[request.type];
        if (handler) {
          handler(JSON.parse(request.data), ws);
        }
      });

      ws.on('close', () => {
        users.removeSocket(ws);
      });
    });
  },
};
