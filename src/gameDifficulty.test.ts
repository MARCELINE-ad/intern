import { getGameLevel, getNuPogodiEggDelay } from './gameDifficulty';

describe('настройки сложности игр', () => {
  test('повышает уровень каждые 15 секунд', () => {
    expect(getGameLevel(0)).toBe(1);
    expect(getGameLevel(14)).toBe(1);
    expect(getGameLevel(15)).toBe(2);
    expect(getGameLevel(30)).toBe(3);
  });

  test('ускоряет яйца в «Ну, погоди!», но не быстрее предела', () => {
    expect(getNuPogodiEggDelay(1)).toBe(950);
    expect(getNuPogodiEggDelay(2)).toBe(860);
    expect(getNuPogodiEggDelay(100)).toBe(260);
  });
});
