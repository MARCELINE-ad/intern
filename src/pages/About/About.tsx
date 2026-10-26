import style from './About.module.less';

type ControlRowProps = {
  control: string;
  action: string;
};

const ControlRow = ({ control, action }: ControlRowProps) => {
  return (
    <li className={style.controlRow}>
      <kbd className={style.key}>{control}</kbd>
      <span>{action}</span>
    </li>
  );
};

export const About = () => {
  return (
    <section className={style.guide} aria-labelledby="guide-title">
      <header className={style.header}>
        <span className={style.eyebrow}>DRUGOV GAME SYSTEM</span>
        <h1 id="guide-title">Инструкция</h1>
        <p>
          Это браузерная ретро-консоль с тремя играми. Управляйте ею кнопками
          на корпусе, мышью, тачпадом или клавиатурой.
        </p>
      </header>

      <article className={style.card}>
        <h2>Запуск и главное меню</h2>
        <ul className={style.controls}>
          <ControlRow control="PS / ON·OFF" action="Включить или выключить консоль." />
          <ControlRow control="←  →" action="Выбрать раздел в главном меню." />
          <ControlRow control="× / Enter / S" action="Открыть выбранный раздел." />
          <ControlRow control="○ / Esc / D" action="Вернуться в главное меню." />
          <ControlRow control="↑  ↓" action="Прокручивать эту инструкцию." />
          <ControlRow control="VOL − / VOL +" action="Выключить или включить музыку в режиме PSP." />
        </ul>
        <p className={style.note}>
          На телефоне и компьютере можно нажимать прямо на пункты меню и кнопки
          корпуса.
        </p>
      </article>

      <article className={style.card}>
        <div className={style.titleLine}>
          <span className={style.badge}>PSP</span>
          <h2>Тетрис</h2>
        </div>
        <p>
          Собирайте целые горизонтальные линии. Заполненная линия исчезает и
          приносит очки. Со временем фигуры падают быстрее.
        </p>
        <ul className={style.controls}>
          <ControlRow control="←  →" action="Переместить фигуру." />
          <ControlRow control="↓" action="Ускорить падение фигуры." />
          <ControlRow control="↑" action="Повернуть фигуру." />
          <ControlRow control="× / Enter / S" action="Начать заново после окончания игры." />
          <ControlRow control="○ / Esc / D" action="Выйти в главное меню." />
        </ul>
        <p className={style.note}>
          После проигрыша можно ввести имя и сохранить результат в таблице
          рекордов.
        </p>
      </article>

      <article className={style.card}>
        <div className={style.titleLine}>
          <span className={style.badge}>Электроника</span>
          <h2>Ну, погоди!</h2>
        </div>
        <p>
          Перемещайте Волка к нужной корзине и ловите два падающих яйца. После
          трёх пропущенных яиц игра заканчивается. Скорость постепенно растёт.
        </p>
        <ul className={style.controls}>
          <ControlRow control="↑" action="Ловить яйцо сверху слева." />
          <ControlRow control="←" action="Ловить яйцо снизу слева." />
          <ControlRow control="→" action="Ловить яйцо сверху справа." />
          <ControlRow control="↓" action="Ловить яйцо снизу справа." />
          <ControlRow control="Игра Б / W" action="Включить или выключить музыку." />
          <ControlRow control="Время / A" action="Начать игру заново." />
          <ControlRow control="Игра А / Esc / D" action="Выйти в главное меню." />
        </ul>
      </article>

      <article className={style.card}>
        <div className={style.titleLine}>
          <span className={style.badge}>Brick Game</span>
          <h2>Гонки</h2>
        </div>
        <p>
          Перестраивайтесь между полосами и уклоняйтесь от встречных машин.
          Игра становится быстрее с каждым уровнем.
        </p>
        <ul className={style.controls}>
          <ControlRow control="←  →" action="Перемещать машину между полосами." />
          <ControlRow control="SOUND" action="Включить или выключить музыку." />
          <ControlRow control="ROTATE / Enter / S" action="Начать заново после столкновения." />
          <ControlRow control="RESET / Esc / D" action="Выйти в главное меню." />
          <ControlRow control="ON·OFF" action="Выключить или включить консоль." />
        </ul>
      </article>

      <footer className={style.footer}>
        Совет: сначала освойте управление на небольшой скорости — каждый новый
        уровень ускоряет игру.
      </footer>
    </section>
  );
};