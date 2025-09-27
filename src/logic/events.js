import tickEvent from "./tick";

export default function gameEventsReducer(state, action) {
  switch (action.type) {
    case "TICK":
      return tickEvent(state);

    case "PAUSE":
      return { ...state, pause: !state.pause };

    case "RESET":
      return {
        ...state,
        ticks: 0,
        clock: { ...state.clock, gameMs: 0 },
        timeTriggers: state.timeTriggers.map((t) => ({
          ...t,
          nextAtMs: t.everyMs,
        })),
        incidents: [],
        incidentsVersion: 0,
        characters: state.characters.map((c) => ({
          ...c,
          stamina: 100,
          active: true,
        })),
      };

    default:
      return state;
  }
}
