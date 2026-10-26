import style from './App.module.less';
import { Console } from '../Console/Console';

export const App = () => {
  return (
    <div className={style.app}>
      <Console />
    </div>
  );
};
