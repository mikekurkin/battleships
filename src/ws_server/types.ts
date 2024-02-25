import { WebSocket } from 'ws';

export type SocketCommand = {
  type: string;
  data: string;
  id: 0;
};

export type CommandHandler = (data: any, socket: WebSocket) => void;
export type BotCommandHandler = (
  data: any,
  gameId: number,
  botId: number,
  socket: WebSocket,
) => void;

export type ShipData = {
  position: { x: number; y: number };
  direction: boolean; // true for vertical, false for horizontal
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};
