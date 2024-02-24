import { WebSocket } from 'ws';
import { CommandHandler, ShipData } from './types';

import { games } from './games';
import { countOccurences } from './helpers';
import { users } from './users';

const formResponse = (type: string, data: Object) => {
  return JSON.stringify({ type, data: JSON.stringify(data), id: 0 });
};

const reg = async (
  data: { name: string; password: string },
  socket: WebSocket,
) => {
  const responseData = await users.reg(data.name, data.password, socket);
  socket.send(formResponse('reg', responseData));
  update_room();
  update_winners(responseData.index);
};

const create_room = (_: {}, socket: WebSocket) => {
  const userId = users.findIdBySocket(socket);
  if (userId != undefined) games.create(userId);
  update_room();
};

const add_user_to_room = (data: { indexRoom: number }, socket: WebSocket) => {
  const userId = users.findIdBySocket(socket);
  const game = games.getById(data.indexRoom);
  if (game === undefined || userId === undefined) return;
  if (!game.playerIds.includes(userId)) {
    game.addPlayer(userId);
    create_game(data.indexRoom);
  }
  update_room();
};

const create_game = (roomId: number) => {
  const game = games.getById(roomId);
  if (game === undefined) return;
  game.playerIds.forEach((id) => {
    users.sendTo(
      id,
      formResponse('create_game', {
        idGame: game.id,
        idPlayer: id,
      }),
    );
  });
};

const update_room = (playerId?: number) => {
  users.sendTo(playerId ?? 'all', formResponse('update_room', games.rooms));
};

const add_ships = (
  data: { gameId: number; ships: ShipData[]; indexPlayer: number },
  _: WebSocket,
) => {
  const game = games.getById(data.gameId);
  if (game === undefined) return;
  game.placeShips(data.indexPlayer, data.ships);
  if (Object.keys(game.fields).length >= 2) {
    start_game(data.gameId);
  }
};

const start_game = (gameId: number) => {
  const game = games.getById(gameId);
  if (game === undefined) return;
  game.playerIds.forEach((playerId) => {
    const data = {
      ships: game.ships[playerId],
      currentPlayerIndex: playerId,
    };
    users.sendTo(playerId, formResponse('start_game', data));
  });
  turn(gameId);
};

const turn = (gameId: number) => {
  const game = games.getById(gameId);
  if (game === undefined || game.playerIds.length < 2) return;
  game.playerIds.forEach((playerId) => {
    const data = {
      currentPlayer: game.attackerId,
    };
    users.sendTo(playerId, formResponse('turn', data));
  });
};

const attack = (
  data: { gameId: number; x: number; y: number; indexPlayer: number },
  _: WebSocket,
) => {
  const game = games.getById(data.gameId);
  if (game === undefined) return;
  const status = game.attack(data.indexPlayer, { x: data.x, y: data.y });
  if (status === null) return;
  status.forEach((cell) => {
    game.playerIds.forEach((id) => {
      users.sendTo(
        id,
        formResponse('attack', {
          ...cell,
          currentPlayer: data.indexPlayer,
        }),
      );
    });
  });
  if (game.isFinished) finish(data.gameId);
  turn(data.gameId);
};

const randomAttack = (
  data: { gameId: number; indexPlayer: number },
  socket: WebSocket,
) => {
  const game = games.getById(data.gameId);
  if (game === undefined) return;
  const chosenCell = game.getUnhitCell(data.indexPlayer);
  if (!chosenCell) return;
  attack(
    {
      x: chosenCell.x,
      y: chosenCell.y,
      ...data,
    },
    socket,
  );
};

const finish = (gameId: number) => {
  const game = games.getById(gameId);
  if (game === undefined) return;
  game.playerIds.forEach((id) => {
    users.sendTo(
      id,
      formResponse('finish', {
        winPlayer: game.winnerId,
      }),
    );
  });
  update_winners();
};

const update_winners = (playerId?: number) => {
  users.sendTo(
    playerId ?? 'all',
    formResponse(
      'update_winners',
      Array.from(countOccurences(games.winners)).map(([id, count]) => {
        return { name: users.getById(id)?.name, wins: count };
      }),
    ),
  );
};

export const commands: { [cmd: string]: CommandHandler } = {
  reg,
  create_room,
  add_user_to_room,
  add_ships,
  attack,
  randomAttack,
};
