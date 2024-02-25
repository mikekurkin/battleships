import { pbkdf2 } from 'node:crypto';
import { WebSocket } from 'ws';

type User = {
  name: string;
  index: number;
  password_hash: string;
};

class UsersDB {
  private entries: { [name: string]: User };
  private userSockets: { id: number; socket: WebSocket }[];

  constructor() {
    this.entries = {};
    this.userSockets = [];
    this.entries['Bot'] = {
      name: 'Bot',
      index: 0,
      password_hash: 'undefined',
    };
  }

  private static hashPassword = (password: string) => {
    const salt = 'BaTtLeShiPsSalT';
    return new Promise<string>((res, rej) => {
      pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) {
          rej(err);
        } else {
          res(derivedKey.toString());
        }
      });
    });
  };

  removeSocket(socket: WebSocket) {
    this.userSockets = this.userSockets.filter((us) => us.socket != socket);
  }

  sendTo(id: number | 'all', data: string) {
    const socketsToSend = this.userSockets
      .filter((us) => (id == 'all' ? true : id == us.id))
      .map((us) => us.socket);
    console.log(`${data} -> ${id}`);
    socketsToSend.forEach((socket) => socket.send(data));
  }

  findIdBySocket(socket: WebSocket) {
    return this.userSockets.find((us) => us.socket == socket)?.id;
  }

  getById(id: number) {
    const user = Object.values(this.entries).find((user) => user.index == id);
    if (!user) return undefined;
    return { name: user.name, index: user.index };
  }

  async reg(username: string, password: string, socket: WebSocket) {
    if (this.entries[username]) {
      if (
        (await UsersDB.hashPassword(password)) !=
        this.entries[username]!.password_hash
      ) {
        return {
          name: username,
          index: -1,
          error: true,
          errorText: 'Unable to log in',
        };
      }
    } else {
      this.entries[username] = {
        name: username,
        index: Object.keys(this.entries).length,
        password_hash: await UsersDB.hashPassword(password),
      };
    }
    const user = this.entries[username]!;
    this.userSockets.push({ id: user.index, socket });
    return {
      name: user.name,
      index: user.index,
      error: false,
      errorText: '',
    };
  }

  addBotSocket = (socket: WebSocket) => {
    this.userSockets.push({ id: 0, socket });
  };
}

export const users = new UsersDB();
