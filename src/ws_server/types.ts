import { WebSocket } from 'ws';

export type SocketCommand = {
  type: string;
  data: string;
  id: 0;
};

export type CommandHandler = (data: any, socket: WebSocket) => void;
