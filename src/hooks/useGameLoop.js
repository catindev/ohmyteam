import { useEffect, useRef } from "react";

export default function useGameLoop(isPaused, tickInterval, onTick) {
  const intervalRef = useRef(null);

  useEffect(() => {
    // Очищаем предыдущий интервал
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Если игра на паузе, не запускаем цикл
    if (isPaused) return;

    // Запускаем новый игровой цикл
    intervalRef.current = setInterval(onTick, tickInterval);

    // Cleanup функция
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, tickInterval, onTick]);

  // Метод для принудительной остановки (если понадобится)
  const stopLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return { stopLoop };
}
