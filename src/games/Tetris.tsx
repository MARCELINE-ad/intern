import { FormEvent, useEffect, useState } from 'react';
import style from './Tetris.module.less';
import { GameCommand } from '../GameCommand';
import { getGameLevel, getTetrisFallDelay } from '../gameDifficulty';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_COUNT = BOARD_WIDTH * BOARD_HEIGHT;

type TetrominoName = 'I' | 'O' | 'T' | 'L' | 'J' | 'S' | 'Z';

type ActivePiece = {
  name: TetrominoName;
  cells: number[];
};

type RecordEntry = {
  name: string;
  score: number;
};

type GameState = {
  activePiece: ActivePiece;
  nextPiece: ActivePiece;
  lockedCells: number[];
  score: number;
  elapsedSeconds: number;
  isGameOver: boolean;
};

type TetrisProps = {
  command: GameCommand | null;
};

const PIECES: ActivePiece[] = [
  {
    name: 'I',
    cells: [3, 4, 5, 6],
  },
  {
    name: 'O',
    cells: [4, 5, 14, 15],
  },
  {
    name: 'T',
    cells: [4, 13, 14, 15],
  },
  {
    name: 'L',
    cells: [4, 14, 24, 25],
  },
  {
    name: 'J',
    cells: [5, 15, 24, 25],
  },
  {
    name: 'S',
    cells: [4, 5, 13, 14],
  },
  {
    name: 'Z',
    cells: [3, 4, 14, 15],
  },
];

const SCORE_BY_LINES = [0, 100, 300, 500, 800];

const createRandomPiece = (): ActivePiece => {
  const randomIndex = Math.floor(Math.random() * PIECES.length);

  const template = PIECES[randomIndex];

  return {
    name: template.name,
    cells: template.cells.slice(),
  };
};

const createInitialGame = (): GameState => ({
  activePiece: createRandomPiece(),
  nextPiece: createRandomPiece(),
  lockedCells: [],
  score: 0,
  elapsedSeconds: 0,
  isGameOver: false,
});

const getPreviewCells = (piece: ActivePiece): number[] => {
  const rows = piece.cells.map((cell) => Math.floor(cell / BOARD_WIDTH));

  const columns = piece.cells.map((cell) => cell % BOARD_WIDTH);

  const minimumRow = Math.min(...rows);
  const minimumColumn = Math.min(...columns);
  const maximumColumn = Math.max(...columns);

  const pieceWidth = maximumColumn - minimumColumn + 1;

  const horizontalOffset = Math.floor((4 - pieceWidth) / 2);

  const verticalOffset = 1;

  return piece.cells.map((cell) => {
    const row = Math.floor(cell / BOARD_WIDTH);
    const column = cell % BOARD_WIDTH;

    const previewRow = row - minimumRow + verticalOffset;

    const previewColumn = column - minimumColumn + horizontalOffset;

    return previewRow * 4 + previewColumn;
  });
};

const clearFullRows = (lockedCells: number[]): number[] => {
  const fullRows: number[] = [];

  for (let row = 0; row < BOARD_HEIGHT; row += 1) {
    const cellsInRow = lockedCells.filter((cell) => Math.floor(cell / BOARD_WIDTH) === row);

    if (cellsInRow.length === BOARD_WIDTH) {
      fullRows.push(row);
    }
  }

  if (fullRows.length === 0) {
    return lockedCells;
  }

  const remainingCells = lockedCells.filter((cell) => {
    const row = Math.floor(cell / BOARD_WIDTH);

    return fullRows.indexOf(row) === -1;
  });

  return remainingCells.map((cell) => {
    const row = Math.floor(cell / BOARD_WIDTH);

    const clearedRowsBelow = fullRows.filter((fullRow) => fullRow > row).length;

    return cell + clearedRowsBelow * BOARD_WIDTH;
  });
};

const loadRecords = (): RecordEntry[] => {
  try {
    const savedRecords = window.localStorage.getItem('tetris-records');

    if (!savedRecords) {
      return [];
    }

    const parsedRecords = JSON.parse(savedRecords) as Array<RecordEntry | number>;

    return parsedRecords
      .map((record) => {
        if (typeof record === 'number') {
          return {
            name: 'Игрок',
            score: record,
          };
        }

        return record;
      })
      .filter((record) => record.score > 0 || record.name !== 'Игрок')
      .sort((firstRecord, secondRecord) => secondRecord.score - firstRecord.score)
      .slice(0, 3);
  } catch (error) {
    return [];
  }
};

const movePieceDown = (currentGame: GameState): GameState => {
  if (currentGame.isGameOver) {
    return currentGame;
  }

  const nextCells = currentGame.activePiece.cells.map((cell) => cell + BOARD_WIDTH);

  const touchesBottom = currentGame.activePiece.cells.some(
    (cell) => Math.floor(cell / BOARD_WIDTH) === BOARD_HEIGHT - 1,
  );

  const touchesLockedCells = nextCells.some((cell) => currentGame.lockedCells.indexOf(cell) !== -1);

  if (touchesBottom || touchesLockedCells) {
    const combinedCells = currentGame.lockedCells.concat(currentGame.activePiece.cells);

    const cellsAfterClearing = clearFullRows(combinedCells);

    const removedCellCount = combinedCells.length - cellsAfterClearing.length;

    const clearedRowCount = removedCellCount / BOARD_WIDTH;

    const earnedScore = SCORE_BY_LINES[clearedRowCount] || 0;

    const nextActivePiece = currentGame.nextPiece;

    const isGameOver = nextActivePiece.cells.some((cell) => cellsAfterClearing.indexOf(cell) !== -1);

    return {
      activePiece: nextActivePiece,
      nextPiece: createRandomPiece(),
      lockedCells: cellsAfterClearing,
      elapsedSeconds: currentGame.elapsedSeconds,
      score: currentGame.score + earnedScore,
      isGameOver,
    };
  }

  return {
    ...currentGame,
    activePiece: {
      ...currentGame.activePiece,
      cells: nextCells,
    },
  };
};

export const Tetris = ({ command }: TetrisProps) => {
  const [game, setGame] = useState<GameState>(createInitialGame);

  const [records, setRecords] = useState<RecordEntry[]>(loadRecords);

  const [playerName, setPlayerName] = useState('');

  const [isRecordSaved, setIsRecordSaved] = useState(false);

  const cells = Array.from({ length: CELL_COUNT }, (_, index) => index);

  const previewCells = getPreviewCells(game.nextPiece);

  const previewGrid = Array.from({ length: 16 }, (_, index) => index);

  const level = getGameLevel(game.elapsedSeconds);

  const fallDelay = getTetrisFallDelay(level);
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

  // Автоматическое падение фигуры.
  useEffect(() => {
    const fallInterval = window.setInterval(() => {
      setGame((currentGame) => movePieceDown(currentGame));
    }, fallDelay);

    return () => {
      window.clearInterval(fallInterval);
    };
  }, [fallDelay]);

  // Управление фигурой и новая игра.
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

      setPlayerName('');
      setIsRecordSaved(false);
      return;
    }

    setGame((currentGame) => {
      if (currentGame.isGameOver) {
        return currentGame;
      }

      const activeCells = currentGame.activePiece.cells;

      if (command.direction === 'left') {
        const touchesLeftWall = activeCells.some((cell) => cell % BOARD_WIDTH === 0);

        if (touchesLeftWall) {
          return currentGame;
        }

        const nextCells = activeCells.map((cell) => cell - 1);

        const touchesLockedCells = nextCells.some((cell) => currentGame.lockedCells.indexOf(cell) !== -1);

        if (touchesLockedCells) {
          return currentGame;
        }

        return {
          ...currentGame,
          activePiece: {
            ...currentGame.activePiece,
            cells: nextCells,
          },
        };
      }

      if (command.direction === 'right') {
        const touchesRightWall = activeCells.some((cell) => cell % BOARD_WIDTH === BOARD_WIDTH - 1);

        if (touchesRightWall) {
          return currentGame;
        }

        const nextCells = activeCells.map((cell) => cell + 1);

        const touchesLockedCells = nextCells.some((cell) => currentGame.lockedCells.indexOf(cell) !== -1);

        if (touchesLockedCells) {
          return currentGame;
        }

        return {
          ...currentGame,
          activePiece: {
            ...currentGame.activePiece,
            cells: nextCells,
          },
        };
      }

      if (command.direction === 'down') {
        return movePieceDown(currentGame);
      }

      if (command.direction === 'up') {
        // Квадрат O при вращении не меняется.
        if (currentGame.activePiece.name === 'O') {
          return currentGame;
        }

        const pivotCell = activeCells[2];

        const pivotRow = Math.floor(pivotCell / BOARD_WIDTH);

        const pivotColumn = pivotCell % BOARD_WIDTH;

        const rotatedPositions = activeCells.map((cell) => {
          const row = Math.floor(cell / BOARD_WIDTH);

          const column = cell % BOARD_WIDTH;

          const relativeRow = row - pivotRow;

          const relativeColumn = column - pivotColumn;

          return {
            row: pivotRow + relativeColumn,

            column: pivotColumn - relativeRow,
          };
        });

        const isInsideBoard = rotatedPositions.every(
          (position) =>
            position.row >= 0 && position.row < BOARD_HEIGHT && position.column >= 0 && position.column < BOARD_WIDTH,
        );

        if (!isInsideBoard) {
          return currentGame;
        }

        const rotatedCells = rotatedPositions.map((position) => position.row * BOARD_WIDTH + position.column);

        const touchesLockedCells = rotatedCells.some((cell) => currentGame.lockedCells.indexOf(cell) !== -1);

        if (touchesLockedCells) {
          return currentGame;
        }

        return {
          ...currentGame,
          activePiece: {
            ...currentGame.activePiece,
            cells: rotatedCells,
          },
        };
      }

      return currentGame;
    });
  }, [command]);

  const handleRecordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!game.isGameOver || isRecordSaved) {
      return;
    }

    const preparedName = playerName.trim() || 'Игрок';

    const newRecord: RecordEntry = {
      name: preparedName,
      score: game.score,
    };

    const updatedRecords = records
      .concat(newRecord)
      .sort((firstRecord, secondRecord) => secondRecord.score - firstRecord.score)
      .slice(0, 3);

    setRecords(updatedRecords);
    setIsRecordSaved(true);

    window.localStorage.setItem('tetris-records', JSON.stringify(updatedRecords));
  };

  return (
    <section className={style.tetris}>
      <h1 className={style.title}>Тетрис</h1>

      <div className={style.gameLayout}>
        <aside className={style.records}>
          <h2 className={style.panelTitle}>Рекорды</h2>

          <ol className={style.recordsList}>
            {records.length === 0 && (
              <li>
                <span>Рекордов нет</span>
              </li>
            )}

            {records.map((record, index) => (
              <li key={`${record.name}-${index}`}>
                <span>
                  {index + 1}. {record.name}
                </span>

                <strong>{record.score}</strong>
              </li>
            ))}
            <div className={style.informationBlock}>
              <h2 className={style.panelTitle}>Уровень</h2>

              <strong className={style.score}>{level}</strong>
            </div>
          </ol>
        </aside>

        <div className={style.board} aria-label="Игровое поле">
          {cells.map((cell) => {
            const isActive = game.activePiece.cells.indexOf(cell) !== -1;

            const isLocked = game.lockedCells.indexOf(cell) !== -1;

            const isFilled = isActive || isLocked;

            return <div key={cell} className={`${style.cell} ${isFilled ? style.filled : ''}`} />;
          })}

          {game.isGameOver && (
            <div className={style.gameOver}>
              <strong>Игра окончена</strong>

              <span>Счёт: {game.score}</span>

              {!isRecordSaved && (
                <form className={style.recordForm} onSubmit={handleRecordSubmit}>
                  <label htmlFor="tetris-player-name">Введи имя</label>

                  <input
                    id="tetris-player-name"
                    className={style.nameInput}
                    type="text"
                    value={playerName}
                    maxLength={10}
                    autoFocus
                    onChange={(event) => setPlayerName(event.target.value)}
                  />

                  <button className={style.saveButton} type="submit">
                    Сохранить
                  </button>
                </form>
              )}

              {isRecordSaved && (
                <>
                  <span className={style.savedMessage}>Результат сохранён</span>

                  <span>Нажми × для новой игры</span>
                </>
              )}
            </div>
          )}
        </div>

        <aside className={style.gameInformation}>
          <div className={style.informationBlock}>
            <h2 className={style.panelTitle}>Следующая</h2>

            <div className={style.preview} aria-label="Следующая фигура">
              {previewGrid.map((cell) => {
                const isFilled = previewCells.indexOf(cell) !== -1;

                return <div key={cell} className={`${style.previewCell} ${isFilled ? style.previewCellFilled : ''}`} />;
              })}
            </div>
          </div>

          <div className={style.informationBlock}>
            <h2 className={style.panelTitle}>Счёт</h2>

            <strong className={style.score}>{game.score}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
};
