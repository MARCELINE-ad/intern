import { useCallback, useEffect, useRef, useState } from 'react';

import style from './Console.module.less';
import { ConsoleButton } from './ConsoleButton';
import { MainMenu } from '../../pages/MainMenu/MainMenu';
import { About } from '../../pages/About/About';
import { TopBar } from '../TopBar/TopBar';
import { Tetris } from '../../games/Tetris';
import { Elec } from '../../games/Elec';
import { Racing } from '../../games/Racing';
import { Direction, GameCommand } from '../../GameCommand';
import { useConsoleAudio } from './useConsoleAudio';

type ActionButton = 'triangle' | 'circle' | 'cross' | 'square';

type ScreenName = 'menu' | 'about' | 'tetris' | 'nuPogodi' | 'racing';

type ConsoleTheme = 'psp' | 'electronika' | 'brickGame';

type SystemButton = 'start' | 'select';

const MENU_SCREENS: ScreenName[] = ['about', 'tetris', 'nuPogodi', 'racing'];

const LAST_MENU_INDEX = MENU_SCREENS.length - 1;

const getConsoleTheme = (screen: ScreenName): ConsoleTheme => {
  if (screen === 'nuPogodi') {
    return 'electronika';
  }

  if (screen === 'racing') {
    return 'brickGame';
  }

  return 'psp';
};

export const Console = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [currentScreen, setCurrentScreen] = useState<ScreenName>('menu');

  const [isPowerOn, setIsPowerOn] = useState(false);

  const [gameCommand, setGameCommand] = useState<GameCommand | null>(null);

  const screenRef = useRef<HTMLDivElement>(null);

  const consoleTheme = getConsoleTheme(currentScreen);

  const consoleThemeClass = {
    psp: style.pspConsole,
    electronika: style.electronikaConsole,
    brickGame: style.brickGameConsole,
  }[consoleTheme];

  const {
    activateAudio,
    isMusicEnabled,
    playPowerOnSound,
    stopAllAudio,
    toggleMusic,
    turnMusicOff,
    turnMusicOn,
  } = useConsoleAudio({ currentScreen, isPowerOn });

  const handleMusicToggle = useCallback(() => {
    if (!isPowerOn) {
      return;
    }

    activateAudio();
    toggleMusic();
  }, [activateAudio, isPowerOn, toggleMusic]);

  const handleMusicOff = useCallback(() => {
    if (!isPowerOn) {
      return;
    }

    activateAudio();
    turnMusicOff();
  }, [activateAudio, isPowerOn, turnMusicOff]);

  const handleMusicOn = useCallback(() => {
    if (!isPowerOn) {
      return;
    }

    activateAudio();
    turnMusicOn();
  }, [activateAudio, isPowerOn, turnMusicOn]);

  const handlePowerToggle = () => {
    if (isPowerOn) {
      stopAllAudio();
      setIsPowerOn(false);
      return;
    }

    setIsPowerOn(true);
    playPowerOnSound();
  };

  const openMenuItem = useCallback(
    (index: number) => {
      const nextScreen = MENU_SCREENS[index];

      if (!isPowerOn || !nextScreen) {
        return;
      }

      activateAudio();
      setSelectedIndex(index);
      setGameCommand(null);
      setCurrentScreen(nextScreen);
    },
    [activateAudio, isPowerOn],
  );

  const handleDirectionPress = useCallback(
    (direction: Direction) => {
      if (!isPowerOn) {
        return;
      }

      activateAudio();

      if (currentScreen === 'tetris' || currentScreen === 'racing' || currentScreen === 'nuPogodi') {
        setGameCommand((previousCommand) => ({
          type: 'direction',
          direction,
          id: previousCommand ? previousCommand.id + 1 : 1,
        }));

        return;
      }

      if (currentScreen !== 'menu') {
        if (direction === 'up') {
          screenRef.current?.scrollBy({
            top: -100,
            behavior: 'smooth',
          });
        }

        if (direction === 'down') {
          screenRef.current?.scrollBy({
            top: 100,
            behavior: 'smooth',
          });
        }

        return;
      }

      setSelectedIndex((currentIndex) => {
        if (direction === 'left') {
          return currentIndex === 0 ? LAST_MENU_INDEX : currentIndex - 1;
        }

        if (direction === 'right') {
          return currentIndex === LAST_MENU_INDEX ? 0 : currentIndex + 1;
        }

        return currentIndex;
      });
    },
    [activateAudio, currentScreen, isPowerOn],
  );

  const handleActionPress = useCallback(
    (action: ActionButton) => {
      if (!isPowerOn) {
        return;
      }

      activateAudio();

      if (currentScreen === 'nuPogodi' && action === 'triangle') {
        toggleMusic();
        return;
      }

      if (action === 'circle') {
        setCurrentScreen('menu');
        setGameCommand(null);
        return;
      }

      if ((currentScreen === 'tetris' || currentScreen === 'racing') && action === 'cross') {
        setGameCommand((previousCommand) => ({
          type: 'confirm',
          id: previousCommand ? previousCommand.id + 1 : 1,
        }));

        return;
      }

      if (currentScreen === 'nuPogodi' && action === 'square') {
        setGameCommand((previousCommand) => ({
          type: 'confirm',
          id: previousCommand ? previousCommand.id + 1 : 1,
        }));

        return;
      }
      if (action !== 'cross' || currentScreen !== 'menu') {
        return;
      }

      openMenuItem(selectedIndex);
    },
    [activateAudio, currentScreen, isPowerOn, openMenuItem, selectedIndex, toggleMusic],
  );

  const handleSystemButtonPress = useCallback(
    (button: SystemButton) => {
      if (!isPowerOn) {
        return;
      }

      activateAudio();
      console.log(`Нажата системная кнопка: ${button}`);
    },
    [activateAudio, isPowerOn],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.code) {
        case 'ArrowUp':
          event.preventDefault();
          handleDirectionPress('up');
          break;

        case 'ArrowDown':
          event.preventDefault();
          handleDirectionPress('down');
          break;

        case 'ArrowLeft':
          event.preventDefault();
          handleDirectionPress('left');
          break;

        case 'ArrowRight':
          event.preventDefault();
          handleDirectionPress('right');
          break;

        case 'Enter':
        case 'KeyS':
          handleActionPress('cross');
          break;

        case 'Escape':
        case 'KeyD':
          handleActionPress('circle');
          break;

        case 'KeyW':
          handleActionPress('triangle');
          break;

        case 'KeyA':
          handleActionPress('square');
          break;

        case 'Space':
          event.preventDefault();
          handleSystemButtonPress('start');
          break;

        case 'ShiftLeft':
        case 'ShiftRight':
          handleSystemButtonPress('select');
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleActionPress, handleDirectionPress, handleSystemButtonPress]);

  return (
    <div className={`${style.console} ${consoleThemeClass}`}>
      <ConsoleButton
        symbol="PS"
        label={isPowerOn ? 'Выключить консоль' : 'Включить консоль'}
        className={style.powerButton}
        onPress={handlePowerToggle}
      />

      <span className={`${style.powerIndicator} ${isPowerOn ? style.powerIndicatorOn : ''}`} aria-hidden="true" />
      {consoleTheme === 'psp' && (
        <div className={style.volumeButtons}>
          <ConsoleButton
            symbol="−"
            label="Выключить музыку"
            className={style.volumeDownButton}
            onPress={handleMusicOff}
          />
          <ConsoleButton
            symbol="+"
            label="Включить музыку"
            className={style.volumeUpButton}
            onPress={handleMusicOn}
          />
        </div>
      )}

      {consoleTheme === 'brickGame' && (
        <ConsoleButton
          symbol="SOUND"
          label={isMusicEnabled ? 'Выключить музыку' : 'Включить музыку'}
          className={style.soundButton}
          onPress={handleMusicToggle}
        />
      )}

      <div className={style.dpad}>
        <ConsoleButton symbol="↑" label="Вверх" className={style.dpadUp} onPress={() => handleDirectionPress('up')} />

        <ConsoleButton
          symbol="↓"
          label="Вниз"
          className={style.dpadDown}
          onPress={() => handleDirectionPress('down')}
        />

        <ConsoleButton
          symbol="←"
          label="Влево"
          className={style.dpadLeft}
          onPress={() => handleDirectionPress('left')}
        />

        <ConsoleButton
          symbol="→"
          label="Вправо"
          className={style.dpadRight}
          onPress={() => handleDirectionPress('right')}
        />
      </div>

      <div className={style.actionButtons}>
        <ConsoleButton
          symbol="△"
          label={
            consoleTheme === 'electronika'
              ? 'Игра Б — ' + (isMusicEnabled ? 'выключить музыку' : 'включить музыку')
              : 'Треугольник'
          }
          className={style.actionTriangle}
          onPress={() => handleActionPress('triangle')}
        />

        <ConsoleButton
          symbol="○"
          label={consoleTheme === 'electronika' ? 'Игра А — выход в главное меню' : 'Назад'}
          className={style.actionCircle}
          onPress={() => handleActionPress('circle')}
        />

        <ConsoleButton
          symbol="×"
          label="Подтвердить"
          className={style.actionCross}
          onPress={() => handleActionPress('cross')}
        />

        <ConsoleButton
          symbol="□"
          label={consoleTheme === 'electronika' ? 'Время' : 'Квадрат'}
          className={style.actionSquare}
          onPress={() => handleActionPress('square')}
        />
      </div>

      <div className={style.systemButtons}>
        <ConsoleButton
          symbol="SELECT"
          label="Выбрать"
          className={style.selectButton}
          onPress={() => handleSystemButtonPress('select')}
        />

        <ConsoleButton
          symbol="START"
          label="Старт"
          className={style.startButton}
          onPress={() => handleSystemButtonPress('start')}
        />
      </div>

      <div ref={screenRef} className={`${style.screen} ${isPowerOn ? '' : style.screenOff}`}>
        {isPowerOn && (
          <>
            {consoleTheme === 'psp' && <TopBar />}

            {currentScreen === 'menu' && <MainMenu selectedIndex={selectedIndex} onSelect={openMenuItem} />}

            {currentScreen === 'about' && <About />}

            {currentScreen === 'tetris' && <Tetris command={gameCommand} />}

            {currentScreen === 'nuPogodi' && <Elec command={gameCommand} />}

            {currentScreen === 'racing' && <Racing command={gameCommand} />}
          </>
        )}
      </div>
    </div>
  );
};
