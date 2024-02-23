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
    this.attacks = {};
  }
  opponent(playerId: number | string) {
    if (typeof playerId === 'string')
      try {
        playerId = parseInt(playerId);
      } catch {
        return undefined;
      }
    if (this.playerIds.length != 2 || !this.playerIds.includes(playerId))
      return undefined;
    return this.playerIds.filter((id) => id != playerId).pop();
  }
  get fields() {
    let fs: { [playerId: string]: (string | null)[][] } = {};
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
    Object.entries(this.attacks).forEach(([playerId, attacks]) => {
      attacks.forEach((attack) => {
        const opponent = this.opponent(playerId);
        if (opponent) {
          if (fs[opponent]?.[attack.y]?.[attack.x] !== undefined)
            fs[opponent]![attack.y]![attack.x] =
              fs[opponent]![attack.y]![attack.x] === null ? 'o' : 'x';
        }
      });
    });
    return fs;
  }
  ships: {
    [playerId: string]: ShipsData;
  };
  attacks: {
    [playerId: string]: { x: number; y: number }[];
  };
  placeShips(playerId: number, ships: ShipsData) {
    this.ships[playerId] = ships;
    // console.table(this.fields[playerId]);
  }
  attack(
    playerId: number,
    position: { x: number; y: number },
  ): 'miss' | 'killed' | 'shot' | null {
    if (!this.attacks[playerId]) this.attacks[playerId] = [];
    if (this.attacks[playerId]!.includes(position)) return null;
    const opponentFieldBefore = this.fields[this.opponent(playerId) ?? -1];
    const shotShipId = opponentFieldBefore?.[position.y]?.[position.x];
    this.attacks[playerId]!.push(position);
    const opponentFieldAfter = this.fields[this.opponent(playerId) ?? -1];
    // console.table(opponentFieldAfter);
    if (shotShipId == null) return 'miss';
    if (opponentFieldAfter && !opponentFieldAfter.flat().includes(shotShipId))
      return 'killed';
    return 'shot';
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
