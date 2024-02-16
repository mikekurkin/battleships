import { WebSocketServer } from 'ws';

export const wsServer = {
  start(port) {
    const wss = new WebSocketServer({ port });
    wss.on('connection', (ws) => {
      ws.on('error', console.error);

      ws.on('message', (data) => {
        console.log(JSON.parse(data.toString()));
      });
    });
  },
};
