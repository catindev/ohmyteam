import { useEffect, useReducer, useRef, useMemo } from "react";
import initialState from "./logic/state";
import gameEventsReducer from "./logic/events";
import { formatGameTime } from "./logic/utils";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function Game() {
  const [state, dispatch] = useReducer(gameEventsReducer, initialState);
  const intervalRef = useRef(null);

  // игровой цикл
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (state.pause) return;
    intervalRef.current = setInterval(
      () => dispatch({ type: "TICK" }),
      state.settings.tick
    );
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.pause, state.settings.tick]);

  // логируем ТОЛЬКО новые инциденты
  const lastSeenRef = useRef(0);
  useEffect(() => {
    if (state.incidentsVersion > lastSeenRef.current) {
      const newCount = state.incidentsVersion - lastSeenRef.current;
      const slice = state.incidents.slice(-newCount);
      slice.forEach((ev) => console.log(ev.message));
      lastSeenRef.current = state.incidentsVersion;
    }
  }, [state.incidentsVersion, state.incidents]);

  const gameEpochMs = state.clock.startEpochMs + state.clock.gameMs;
  const daysPassed = Math.floor(state.clock.gameMs / DAY_MS);
  const gameDateString = useMemo(
    () => formatGameTime(gameEpochMs),
    [gameEpochMs]
  );

  return (
    <main className="box">
      <h1>TheGame</h1>
      <div className="line">Game loops: {state.ticks}</div>
      <div className="line">Game time: {gameDateString}</div>
      <div className="line">Days passed: {daysPassed}</div>

      <div className="controls">
        <button onClick={() => dispatch({ type: "PAUSE" })}>
          {state.pause ? "▶️ Старт" : "⏸️ Пауза"}
        </button>
        <button
          onClick={() => dispatch({ type: "RESET" })}
          style={{ marginLeft: 8 }}
        >
          🔄 Сбросить
        </button>
      </div>

      <div className="characters">
        <h2>Characters</h2>
        <ul>
          {state.characters.map((character) => (
            <li key={character.id}>
              {character.name}{" "}
              <button
                onClick={() =>
                  dispatch({
                    type: "TOGGLE_TASK",
                    payload: { id: character.id },
                  })
                }
              >
                {character.task ? "Отдыхать" : "Работать"}
              </button>{" "}
              stamina {character.stamina}{" "}
              {character.task ? "" : "(не работает)"}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
