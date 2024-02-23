import { WebSocket } from 'ws';
import { CommandHandler, SocketCommand } from './types';

import { games } from './games';
import { users } from './users';

const formResponse = (type: string, data: Object): SocketCommand => {
  return { type, data: JSON.stringify(data), id: 0 };
};

const reg = async (
  data: { name: string; password: string },
  socket: WebSocket,
) => {
  const responseData = await users.reg(data.name, data.password, socket);
  socket.send(JSON.stringify(formResponse('reg', responseData)));
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
  if (userId && game && !game.playerIds.includes(userId)) {
    game.addPlayer(userId);
    game?.playerIds.forEach((id) => {
      users.sendTo(
        id,
        JSON.stringify(
          formResponse('create_game', {
            idGame: game.id,
            idPlayer: userId,
          }),
        ),
      );
    });
  }
  update_room();
};

const update_room = () => {
  users.sendTo('all', JSON.stringify(formResponse('update_room', games.rooms)));
};

export const commands: { [cmd: string]: CommandHandler } = {
  reg,
  create_room,
  add_user_to_room,
  //   add_ships: () => {},
  //   attack: () => {},
  //   randomAttack: () => {},
};
