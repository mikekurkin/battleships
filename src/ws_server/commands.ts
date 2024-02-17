import { WebSocket } from 'ws';
import { formResponse } from './interface';
import { users } from './users';

export const reg = async (
  data: { name: string; password: string },
  socket: WebSocket,
) => {
  const responseData = await users.reg(data.name, data.password, socket);
  socket.send(JSON.stringify(formResponse('reg', responseData)));
};
