import { users } from './users';

class BattleshipsGame {
  id: number;
  playerIds: number[] = [];
  get isAvailable() {
    return this.playerIds.length < 2;
  }
  addPlayer(playerId: number) {
    this.playerIds.push(playerId);
  }
  constructor(gameId: number, initiatorId: number) {
    this.id = gameId;
    this.playerIds.push(initiatorId);
  }
}

class GamesDB {
  private entries: BattleshipsGame[] = [];
  get rooms() {
    return this.entries
      .filter((entry) => entry.isAvailable)
      .map((game) => {
        return {
          roomId: game.id,
          roomUsers: game.playerIds.map((id) => {
            return users.getById(id);
          }),
        };
      });
  }

  create(initiatorId: number) {
    this.entries.push(new BattleshipsGame(this.entries.length, initiatorId));
  }

  getById(id: number) {
    return this.entries.find((game) => game.id == id);
  }
}

export const games = new GamesDB();
