import { useEffect, useState } from 'react';

import style from './Elec.module.less';
import { Direction, GameCommand } from '../GameCommand';
import { getGameLevel, getNuPogodiEggDelay } from '../gameDifficulty';

import backgroundImage from '../assets/images/nu-pogodi/background.png';
import eggImage from '../assets/images/nu-pogodi/egg.png';
import wolfLowerLeft from '../assets/images/nu-pogodi/wolf_lower_left.png';
import wolfLowerRight from '../assets/images/nu-pogodi/wolf_lower_right.png';
import wolfUpperLeft from '../assets/images/nu-pogodi/wolf_upper_left.png';
import wolfUpperRight from '../assets/images/nu-pogodi/wolf_upper_right.png';

type ElecProps = {
  command: GameCommand | null;
};

type WolfPosition = 'upperLeft' | 'lowerLeft' | 'upperRight' | 'lowerRight';

type EggPosition = {
  left: number;
  top: number;
  rotation: number;
};

type Egg = {
  id: number;
  track: WolfPosition;
  step: number;
  delay: number;
};

type ElecState = {
  wolfPosition: WolfPosition;
  eggs: Egg[];
  score: number;
  misses: number;
  elapsedSeconds: number;
  isGameOver: boolean;
};

const positionByDirection: Record<Direction, WolfPosition> = {
  up: 'upperLeft',
  left: 'lowerLeft',
  right: 'upperRight',
  down: 'lowerRight',
};

const wolfSprites: Record<WolfPosition, string> = {
  upperLeft: wolfUpperLeft,
  lowerLeft: wolfLowerRight,
  upperRight: wolfUpperRight,
  lowerRight: wolfLowerLeft,
};

const wolfPositionClasses: Record<WolfPosition, string> = {
  upperLeft: style.upperLeft,
  lowerLeft: style.lowerLeft,
  upperRight: style.upperRight,
  lowerRight: style.lowerRight,
};

const tracks: WolfPosition[] = ['upperLeft', 'lowerLeft', 'upperRight', 'lowerRight'];

const eggPositions: Record<WolfPosition, EggPosition[]> = {
  upperLeft: [
    { left: 8, top: 27, rotation: -48 },
    { left: 13, top: 32, rotation: -42 },
    { left: 18, top: 37, rotation: -36 },
    { left: 23, top: 42, rotation: -30 },
    { left: 29, top: 48, rotation: -24 },
  ],
  lowerLeft: [
    { left: 8, top: 59, rotation: 48 },
    { left: 13, top: 64, rotation: 42 },
    { left: 18, top: 69, rotation: 36 },
    { left: 23, top: 74, rotation: 30 },
    { left: 29, top: 79, rotation: 24 },
  ],
  upperRight: [
    { left: 92, top: 27, rotation: 48 },
    { left: 87, top: 32, rotation: 42 },
    { left: 82, top: 37, rotation: 36 },
    { left: 77, top: 42, rotation: 30 },
    { left: 71, top: 48, rotation: 24 },
  ],
  lowerRight: [
    { left: 92, top: 59, rotation: -48 },
    { left: 87, top: 64, rotation: -42 },
    { left: 82, top: 69, rotation: -36 },
    { left: 77, top: 74, rotation: -30 },
    { left: 71, top: 79, rotation: -24 },
  ],
};

const createEgg = (id: number, delay = 0): Egg => ({
  id,
  track: tracks[Math.floor(Math.random() * tracks.length)],
  step: 0,
  delay,
});

const createInitialGame = (): ElecState => ({
  wolfPosition: 'upperLeft',
  eggs: [createEgg(1), createEgg(2, 3)],
  score: 0,
  misses: 0,
  elapsedSeconds: 0,
  isGameOver: false,
});

export const Elec = ({ command }: ElecProps) => {
  const [game, setGame] = useState<ElecState>(createInitialGame);

  useEffect(() => {
    if (!command) {
      return;
    }

    if (command.type === 'confirm') {
      setGame(createInitialGame());
      return;
    }

    setGame((currentGame) => {
      if (currentGame.isGameOver) {
        return currentGame;
      }

      return {
        ...currentGame,
        wolfPosition: positionByDirection[command.direction],
      };
    });
  }, [command]);

  useEffect(() => {
    const gameTimer = window.setInterval(() => {
      setGame((currentGame) => {
        if (currentGame.isGameOver) {
          return currentGame;
        }

        return {
          ...currentGame,
          elapsedSeconds: currentGame.elapsedSeconds + 1,
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(gameTimer);
    };
  }, []);

  const level = getGameLevel(game.elapsedSeconds);

  useEffect(() => {
    const eggTimer = window.setInterval(() => {
      setGame((currentGame) => {
        if (currentGame.isGameOver) {
          return currentGame;
        }

        let nextScore = currentGame.score;
        let nextMisses = currentGame.misses;

        const nextEggs = currentGame.eggs.map((egg) => {
          if (egg.delay > 0) {
            return {
              ...egg,
              delay: egg.delay - 1,
            };
          }

          const lastStep = eggPositions[egg.track].length - 1;

          if (egg.step < lastStep) {
            return {
              ...egg,
              step: egg.step + 1,
            };
          }

          const isCaught = currentGame.wolfPosition === egg.track;

          if (isCaught) {
            nextScore += 1;
          } else {
            nextMisses += 1;
          }

          return createEgg(egg.id, 2);
        });

        const limitedMisses = Math.min(nextMisses, 3);

        return {
          ...currentGame,
          eggs: nextEggs,
          score: nextScore,
          misses: limitedMisses,
          isGameOver: limitedMisses >= 3,
        };
      });
    }, getNuPogodiEggDelay(level));

    return () => {
      window.clearInterval(eggTimer);
    };
  }, [level]);

  const scoreText = `000${game.score}`.slice(-3);

  return (
    <section className={style.game}>
      <div className={style.field}>
        <img className={style.background} src={backgroundImage} alt="" />

        <img
          className={`${style.wolf} ${wolfPositionClasses[game.wolfPosition]}`}
          src={wolfSprites[game.wolfPosition]}
          alt="Волк с корзиной"
        />

        {!game.isGameOver &&
          game.eggs.map((egg) => {
            if (egg.delay > 0) {
              return null;
            }

            const eggPosition = eggPositions[egg.track][egg.step];

            return (
              <img
                key={egg.id}
                className={style.egg}
                src={eggImage}
                alt="Яйцо"
                style={{
                  left: eggPosition.left + '%',
                  top: eggPosition.top + '%',
                  transform:
                    'translate(-50%, -50%) rotate(' +
                    eggPosition.rotation +
                    'deg)',
                }}
              />
            );
          })}

        <div className={style.score}>СЧЁТ {scoreText}</div>

        <div className={style.level}>УРОВЕНЬ {level}</div>

        <div className={style.misses} aria-label={`Промахов: ${game.misses}`}>
          ПРОМАХИ {Array.from({ length: 3 }, (_, index) => (index < game.misses ? '●' : '○')).join(' ')}
        </div>

        {game.isGameOver && (
          <div className={style.gameOver}>
            <strong>КОНЕЦ ИГРЫ</strong>
            <span>СЧЁТ {scoreText}</span>
            <small>НАЖМИ «ВРЕМЯ»</small>
          </div>
        )}
      </div>
    </section>
  );
};
