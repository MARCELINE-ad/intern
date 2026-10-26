const LEVEL_DURATION_SECONDS = 15;

export const getGameLevel = (elapsedSeconds: number): number => {
  return Math.floor(elapsedSeconds / LEVEL_DURATION_SECONDS) + 1;
};

export const getRacingMovementStep = (level: number): number => {
  return Math.min(4.5 + (level - 1) * 0.5, 10);
};

export const getTetrisFallDelay = (level: number): number => {
  return Math.max(200, 1000 - (level - 1) * 100);
};
export const getNuPogodiEggDelay = (level: number): number => {
  return Math.max(260, 950 - (level - 1) * 90);
};
