import { ShipsData } from './types';
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
    this.ships = {};
  }
  get fields() {
    let fs: { [playerId: string]: string[][] } = {};
    Object.entries(this.ships).forEach(([playerId, ships]) => {
      fs[playerId] = Array.from(Array(10), () => Array(10).fill(null));
      Object.entries(ships).forEach(([shipId, ship]) => {
        for (var i = 0; i < ship.length; i++) {
          fs[playerId]![ship.position.y + (ship.direction ? i : 0)]![
            ship.position.x + (ship.direction ? 0 : i)
          ] = shipId;
        }
      });
    });
    return fs;
  }
  ships: {
    [playerId: string]: ShipsData;
  };
  placeShips(playerId: number, ships: ShipsData) {
    this.ships[playerId] = ships;
    // console.table(this.fields[playerId]);
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
