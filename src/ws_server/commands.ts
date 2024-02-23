import { WebSocket } from 'ws';
import { CommandHandler, ShipsData } from './types';

import { games } from './games';
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
};

const create_room = (_: {}, socket: WebSocket) => {
  const userId = users.findIdBySocket(socket);
  if (userId != undefined) games.create(userId);
  update_room();
};

const add_user_to_room = (data: { indexRoom: number }, socket: WebSocket) => {
  const userId = users.findIdBySocket(socket);
  const game = games.getById(data.indexRoom);
  if (game === undefined) return;
  if (userId && game && !game.playerIds.includes(userId)) {
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

const update_room = () => {
  users.sendTo('all', formResponse('update_room', games.rooms));
};

const add_ships = (
  data: { gameId: number; ships: ShipsData; indexPlayer: number },
  _: WebSocket,
) => {
  const game = games.getById(data.gameId);
  if (game === undefined) return;
  game.placeShips(data.indexPlayer, data.ships);
  console.log(Object.keys(game.fields).length);
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

const turn = (gameId: number, currentAttackerId?: number) => {
  const game = games.getById(gameId);
  if (game === undefined || game.playerIds.length < 2) return;
  if (currentAttackerId === undefined)
    currentAttackerId = game.playerIds[Math.floor(Math.random() * 2)]!;
  game.playerIds.forEach((playerId) => {
    const data = {
      currentPlayer: currentAttackerId,
    };
    users.sendTo(playerId, formResponse('turn', data));
  });
};

export const commands: { [cmd: string]: CommandHandler } = {
  reg,
  create_room,
  add_user_to_room,
  add_ships,
  //   attack: () => {},
  //   randomAttack: () => {},
};
