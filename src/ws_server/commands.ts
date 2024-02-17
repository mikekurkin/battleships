import { WebSocket } from 'ws';
import { CommandHandler, SocketCommand } from './types';
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
};

export const commands: { [cmd: string]: CommandHandler } = {
  reg,
  //   create_room: () => {},
  //   add_user_to_room: () => {},
  //   add_ships: () => {},
  //   attack: () => {},
  //   randomAttack: () => {},
};
