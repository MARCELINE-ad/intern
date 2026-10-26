import style from './ConsoleButton.module.less';

type ConsoleButtonProps = {
  symbol: string;
  label: string;
  className?: string;
  onPress: () => void;
};

export const ConsoleButton = ({ symbol, label, className = '', onPress }: ConsoleButtonProps) => {
  return (
    <button type="button" className={`${style.button} ${className}`} aria-label={label} onClick={onPress}>
      {symbol}
    </button>
  );
};
