import { reg } from './commands';
import { CommandHandler, SocketCommand } from './types';

export const commands: { [cmd: string]: CommandHandler } = {
  reg,
  //   create_room: () => {},
  //   add_user_to_room: () => {},
  //   add_ships: () => {},
  //   attack: () => {},
  //   randomAttack: () => {},
};

export const formResponse = (type: string, data: Object): SocketCommand => {
  return { type, data: JSON.stringify(data), id: 0 };
};
