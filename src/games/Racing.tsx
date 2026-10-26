import { useEffect, useState } from 'react';

import style from './Racing.module.less';
import { GameCommand } from '../GameCommand';
import { getGameLevel, getRacingMovementStep } from '../gameDifficulty';

type RacingProps = {
  command: GameCommand | null;
};

type Obstacle = {
  id: number;
  lane: number;
  top: number;
};

type RacingState = {
  playerLane: number;
  obstacles: Obstacle[];
  score: number;
  elapsedSeconds: number;
  isGameOver: boolean;
};

const FIRST_LANE = 0;
const LAST_LANE = 2;
const LANE_COUNT = 3;

const createRandomLane = () => Math.floor(Math.random() * LANE_COUNT);

const createInitialGame = (): RacingState => ({
  playerLane: 1,

  obstacles: [
    {
      id: 1,
      lane: createRandomLane(),
      top: -15,
    },
    {
      id: 2,
      lane: createRandomLane(),
      top: -65,
    },
    {
      id: 3,
      lane: createRandomLane(),
      top: -115,
    },
  ],

  score: 0,
  elapsedSeconds: 0,
  isGameOver: false,
});

export const Racing = ({ command }: RacingProps) => {
  const [game, setGame] = useState<RacingState>(createInitialGame);

  // Управление и перезапуск.
  useEffect(() => {
    if (!command) {
      return;
    }

    if (command.type === 'confirm') {
      setGame((currentGame) => {
        if (!currentGame.isGameOver) {
          return currentGame;
        }

        return createInitialGame();
      });

      return;
    }

    setGame((currentGame) => {
      if (currentGame.isGameOver) {
        return currentGame;
      }

      if (command.direction === 'left') {
        return {
          ...currentGame,

          playerLane: Math.max(FIRST_LANE, currentGame.playerLane - 1),
        };
      }

      if (command.direction === 'right') {
        return {
          ...currentGame,

          playerLane: Math.min(LAST_LANE, currentGame.playerLane + 1),
        };
      }

      return currentGame;
    });
  }, [command]);

  // Считаем продолжительность партии.
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

  // Двигаем оба препятствия.
  useEffect(() => {
    const obstacleInterval = window.setInterval(() => {
      setGame((currentGame) => {
        if (currentGame.isGameOver) {
          return currentGame;
        }

        const currentLevel = getGameLevel(currentGame.elapsedSeconds);

        const movementStep = getRacingMovementStep(currentLevel);

        const movedObstacles = currentGame.obstacles.map((obstacle) => ({
          ...obstacle,

          top: obstacle.top + movementStep,
        }));

        const hasCollision = movedObstacles.some((obstacle) => {
          const isCollisionHeight = obstacle.top >= 78 && obstacle.top <= 94;

          const isSameLane = obstacle.lane === currentGame.playerLane;

          return isCollisionHeight && isSameLane;
        });

        if (hasCollision) {
          return {
            ...currentGame,
            obstacles: movedObstacles,
            isGameOver: true,
          };
        }

        let passedObstacleCount = 0;

        const updatedObstacles = movedObstacles.map((obstacle) => {
          if (obstacle.top < 100) {
            return obstacle;
          }

          passedObstacleCount += 1;

          return {
            ...obstacle,
            lane: createRandomLane(),
            top: -15,
          };
        });

        return {
          ...currentGame,
          obstacles: updatedObstacles,

          score: currentGame.score + passedObstacleCount,
        };
      });
    }, 120);

    return () => {
      window.clearInterval(obstacleInterval);
    };
  }, []);

  const carPosition = 16.66 + game.playerLane * 33.33;

  const level = getGameLevel(game.elapsedSeconds);

  const scoreText = `0000${game.score}`.slice(-4);

  return (
    <section className={style.game}>
      <div className={style.score}>
        LEVEL {level} SCORE {scoreText}
      </div>

      <div className={style.road}>
        <span className={`${style.laneLine} ${style.firstLaneLine}`} />

        <span className={`${style.laneLine} ${style.secondLaneLine}`} />

        {game.obstacles.map((obstacle) => {
          const obstaclePosition = 16.66 + obstacle.lane * 33.33;

          return (
            <span
              key={obstacle.id}
              className={style.obstacle}
              style={{
                left: `${obstaclePosition}%`,

                top: `${obstacle.top}%`,
              }}
              aria-label="Препятствие"
            >
              ■
            </span>
          );
        })}

        <span
          className={style.car}
          style={{
            left: `${carPosition}%`,
          }}
          aria-label="Машина игрока"
        >
          ▣
        </span>

        {game.isGameOver && (
          <div className={style.gameOver}>
            <strong className={style.gameOverTitle}>CRASH</strong>

            <span>SCORE {scoreText}</span>

            <span>LEVEL {level}</span>

            <span className={style.gameOverHelp}>PRESS ROTATE</span>
          </div>
        )}
      </div>

      <div className={style.help}>LEFT / RIGHT</div>
    </section>
  );
};
