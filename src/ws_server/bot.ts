import WebSocket from 'ws';
import { formResponse } from './commands';
import { shipCells, shipNeighborCells } from './helpers';
import { BotCommandHandler, ShipData, SocketCommand } from './types';

export class Bot {
  ws: WebSocket;
  gameId: number;
  botId: number;

  constructor(roomId: number) {
    this.gameId = roomId;
    this.botId = 0;

    this.ws = new WebSocket('ws://localhost:3000');
    this.ws.on('open', () => {
      this.ws.send(formResponse('reg_bot', { roomId }));
    });
    this.ws.on('message', (data) => {
      if (process.env.DEBUG) console.log('bot: ->', data.toString());
      const request: SocketCommand = JSON.parse(data.toString());
      const handler = botCommands[request.type];
      if (handler) {
        let data = {};
        try {
          data = JSON.parse(request.data);
        } catch {}
        handler(data, this.gameId, this.botId, this.ws);
      }
    });
  }
}

const create_game = (
  data: { idGame: number; idPlayer: number },
  _: number,
  __: number,
  ws: WebSocket,
) => {
  add_ships({ gameId: data.idGame, playerId: data.idPlayer }, _, __, ws);
};

const turn = (
  data: { currentPlayer: number },
  gameId: number,
  botId: number,
  ws: WebSocket,
) => {
  if (data.currentPlayer == botId) {
    setTimeout(() => {
      ws.send(formResponse('randomAttack', { gameId, indexPlayer: botId }));
    }, 500);
  }
};

const add_ships = (
  data: { gameId: number; playerId: number },
  _: number,
  __: number,
  ws: WebSocket,
) => {
  let shipsToPlace = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  let cellsAvailability = Array.from(Array(10), () => Array(10).fill(true));
  const availableCells = () =>
    cellsAvailability
      .map((row, y) =>
        row.map((available, x) => {
          return available ? JSON.stringify({ x, y }) : null;
        }),
      )
      .flat()
      .filter((cell) => cell !== null);
  let ships: ShipData[] = [];

  while (shipsToPlace.length > 0) {
    const iterAvailableCells = availableCells();
    if (iterAvailableCells.length == 0) break;
    const randomPos = JSON.parse(
      iterAvailableCells[
        Math.floor(Math.random() * iterAvailableCells.length)
      ] ?? '{}',
    );
    const randomDirection = Math.random() > 0.5;
    let lengthsToTry = Array.from(new Set(shipsToPlace)).sort();
    while (lengthsToTry.length > 0) {
      const length = lengthsToTry.pop()!;
      const shipToTry = {
        position: randomPos,
        direction: randomDirection,
        type: ['', 'small', 'medium', 'large', 'huge'][length]!,
        length,
      } as ShipData;
      if (
        shipCells(shipToTry).every((cell) =>
          iterAvailableCells.includes(JSON.stringify(cell)),
        )
      ) {
        ships.push(shipToTry);
        [...shipCells(shipToTry), ...shipNeighborCells(shipToTry)].forEach(
          (cell) => (cellsAvailability[cell.y]![cell.x] = false),
        );
        if (shipsToPlace.indexOf(length) >= 0)
          shipsToPlace.splice(shipsToPlace.indexOf(length), 1);
        break;
      }
    }
  }

  ws.send(
    formResponse('add_ships', {
      gameId: data.gameId,
      ships,
      indexPlayer: data.playerId,
    }),
  );
};

const botCommands: { [command: string]: BotCommandHandler } = {
  create_game,
  add_ships,
  turn,
};
