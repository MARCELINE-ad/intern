export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameCommand =
  | {
      type: 'direction';
      direction: Direction;
      id: number;
    }
  | {
      type: 'confirm';
      id: number;
    };
