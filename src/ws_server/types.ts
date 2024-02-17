export type SocketCommand = {
  type: string;
  data: Object;
  id: 0;
};

export type CommandHandler = (data: Object) => SocketCommand;
