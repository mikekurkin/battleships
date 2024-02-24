import { ShipData } from './types';

export const shipNeighborCells = (
  ship: ShipData,
): { x: number; y: number }[] => {
  const vNeighbors = Array(2 + (ship.direction ? ship.length : 1))
    .fill('')
    .map((_, i) => [
      { x: ship.position.x - 1, y: ship.position.y - 1 + i },
      {
        x: ship.position.x + (ship.direction ? 1 : ship.length),
        y: ship.position.y - 1 + i,
      },
    ])
    .flat();

  const hNeighbors = Array(ship.direction ? 1 : ship.length)
    .fill('')
    .map((_, i) => [
      { x: ship.position.x + i, y: ship.position.y - 1 },
      {
        x: ship.position.x + i,
        y: ship.position.y + (ship.direction ? ship.length : 1),
      },
    ])
    .flat();

  return [...vNeighbors, ...hNeighbors].filter(
    (neighbor) =>
      0 <= neighbor.x && neighbor.x <= 9 && 0 <= neighbor.y && neighbor.y <= 9,
  );
};
