import { useReducer, useCallback } from "react";
import initialState from "./logic/state";
import gameEventsReducer from "./logic/eventsReducer";
import useGameLoop from "./hooks/useGameLoop";
import useIncidentLogger from "./hooks/useIncidentLogger";
import useGameClock from "./hooks/useGameClock";

export default function Game() {
  const [state, dispatch] = useReducer(gameEventsReducer, initialState);

  // мемоизируем тик для стабильности
  const handleTick = useCallback(() => {
    dispatch({ type: "TICK" });
  }, []);

  // хук игрового цикла
  useGameLoop(state.pause, state.settings.tick, handleTick);

  // лог новых инцидентов в консоли браузера
  useIncidentLogger(state.incidents, state.incidentsVersion);

  // игровое время
  const { currentGameTime, daysPassed, formatIncidentTime } = useGameClock(
    state.clock
  );

  return (
    <main className="box">
      <h1>TheGame</h1>
      <div className="line">Loops: {state.ticks}</div>
      <div className="line">Current time: {currentGameTime}</div>
      <div className="line">Days passed: {daysPassed}</div>
      <div className="line">Budget: {state.budget}</div>

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
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Игровые события {state.incidentsVersion}</h2>
        <ul className="line">
          {state.incidents.length > 0 &&
            state.incidents.map((incident) => (
              <li key={incident.id}>
                {formatIncidentTime(incident.atMs, state.clock.startEpochMs)}
                {" - "}
                {incident.message}
              </li>
            ))}
        </ul>
      </div>
    </main>
  );
}
