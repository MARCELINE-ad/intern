import style from './MainMenu.module.less';
import instructionIcon from '../../assets/images/menu/instruction.svg';
import tetrisIcon from '../../assets/images/menu/tetris.svg';
import nuPogodiIcon from '../../assets/images/menu/nu-pogodi.svg';
import racingIcon from '../../assets/images/menu/racing.svg';

type MenuItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

const menuItems: MenuItem[] = [
  {
    id: 'about',
    icon: instructionIcon,
    title: 'Инструкция',
    description: 'Управление и правила',
  },
  {
    id: 'tetris',
    icon: tetrisIcon,
    title: 'Тетрис',
    description: 'Классическая игра с фигурами',
  },
  {
    id: 'nu-pogodi',
    icon: nuPogodiIcon,
    title: 'Ну, погоди!',
    description: 'Игра на Электронике',
  },
  {
    id: 'racing',
    icon: racingIcon,
    title: 'Гонки',
    description: 'Гонки на Brick Game',
  },
];

type MainMenuProps = {
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export const MainMenu = ({ selectedIndex, onSelect }: MainMenuProps) => {
  return (
    <nav className={style.menu} aria-label="Главное меню">
      {menuItems.map((item, index) => (
        <button
          className={[style.item, index === selectedIndex ? style.selected : ''].join(' ')}
          type="button"
          key={item.id}
          onClick={() => onSelect(index)}
        >
          <span className={style.icon} aria-hidden="true">
            <img className={style.iconImage} src={item.icon} alt="" />
          </span>

          <span className={style.title}>{item.title}</span>

          <small className={style.description}>{item.description}</small>
        </button>
      ))}
    </nav>
  );
};