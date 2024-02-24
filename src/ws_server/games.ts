import { shipNeighborCells } from './helpers';
import { ShipData } from './types';
import { users } from './users';

class BattleshipsGame {
  id: number;
  playerIds: number[] = [];
  get isAvailable() {
    return this.playerIds.length < 2;
  }
  attackerId: number;
  addPlayer(playerId: number) {
    this.playerIds.push(playerId);
    this.attackerId = this.playerIds[Math.floor(Math.random() * 2)]!;
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
    [playerId: string]: ShipData[];
  };
  attacks: {
    [playerId: string]: { x: number; y: number }[];
  };
  placeShips(playerId: number, ships: ShipData[]) {
    this.ships[playerId] = ships;
    // console.table(this.fields[playerId]);
  }
  attack(
    playerId: number,
    position: { x: number; y: number },
  ):
    | {
        position: { x: number; y: number };
        status: 'miss' | 'killed' | 'shot';
      }[]
    | null {
    if (playerId != this.attackerId) return null;
    if (!this.attacks[playerId]) this.attacks[playerId] = [];
    if (this.attacks[playerId]!.includes(position)) return null;
    const opponentId = this.opponent(playerId);
    if (!opponentId) return null;
    const opponentFieldBefore = this.fields[opponentId];
    const shotShipId = opponentFieldBefore?.[position.y]?.[position.x];
    this.attacks[playerId]!.push(position);
    const opponentFieldAfter = this.fields[opponentId];
    // console.table(opponentFieldAfter);
    let shotShip: ShipData | undefined;
    try {
      shotShip = this.ships[opponentId]![parseInt(shotShipId!)]!;
    } catch {}
    if (shotShipId == null || shotShip == null) {
      this.attackerId = opponentId;
      return [{ position, status: 'miss' }];
    }
    if (opponentFieldAfter && opponentFieldAfter.flat().includes(shotShipId))
      return [{ position, status: 'shot' }];

    const misses = shipNeighborCells(shotShip)
      .map((cell) => {
        this.attackerId = playerId;
        return this.attack(playerId, cell) ?? [];
      })
      .flat();

    this.attackerId = playerId;
    return [{ position, status: 'killed' }, ...misses];
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
