import { WebSocket } from 'ws';

export type SocketCommand = {
  type: string;
  data: string;
  id: 0;
};

export type CommandHandler = (data: any, socket: WebSocket) => void;

export type ShipsData = {
  position: { x: number; y: number };
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}[];
