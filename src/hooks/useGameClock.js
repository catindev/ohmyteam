import { useMemo } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatGameTime(epochMs) {
  const d = new Date(epochMs);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/**
 * Возвращает номер игрового дня (начиная с 1) и время суток внутри этого дня.
 * @param {number} atMs          // incident.atMs (startEpochMs + gameMs на момент события)
 * @param {number} startEpochMs  // state.clock.startEpochMs
 */
function splitGameDayTime(atMs, startEpochMs) {
  const sinceStart = Math.max(0, atMs - startEpochMs);
  const dayIndex = Math.floor(sinceStart / DAY_MS); // 0..N
  const timeMs = sinceStart % DAY_MS; // остаток внутри суток

  const hours = Math.floor(timeMs / (60 * 60 * 1000));
  const minutes = Math.floor((timeMs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((timeMs % (60 * 1000)) / 1000);

  return { day: dayIndex + 1, hours, minutes, seconds };
}

function formatIncidentTime(atMs, startEpochMs) {
  const { day, hours, minutes, seconds } = splitGameDayTime(atMs, startEpochMs);
  const pad = (n) => String(n).padStart(2, "0");
  return `Day ${day} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function useGameClock(clock) {
  const gameEpochMs = clock.startEpochMs + clock.gameMs;
  const daysPassed = Math.floor(clock.gameMs / DAY_MS);
  const currentGameTime = useMemo(
    () => formatGameTime(gameEpochMs),
    [gameEpochMs]
  );
  return { gameEpochMs, daysPassed, currentGameTime, formatIncidentTime };
}
