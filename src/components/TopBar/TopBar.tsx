import { useEffect, useState } from 'react';
import style from './TopBar.module.less';

const getCurrentTime = () => {
  return new Date().toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TopBar = () => {
  // useState и useEffect остаются здесь

  return (
    <header className={style.topBar}>
      <span className={style.brand}>DRUGOV</span>

      <div className={style.status}>
        <time className={style.clock}>{getCurrentTime()}</time>

        <span className={style.battery} role="img" aria-label="Уровень батареи">
          ▰▰▰▱
        </span>
      </div>
    </header>
  );
};
