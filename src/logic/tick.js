import { timeHandlerRegistry } from "./handlers";

export default function tickEvent(state) {
  if (state.pause) return state;

  // 1 реальная секунда = 60 игровых секунд → tick(ms)*60
  const addMs = state.settings.tick * 60;
  const prevGameMs = state.clock.gameMs;
  const nextGameMs = prevGameMs + addMs;

  let nextState = {
    ...state,
    ticks: state.ticks + 1,
    clock: { ...state.clock, gameMs: nextGameMs },
  };

  // прогон триггеров
  const updatedTriggers = nextState.timeTriggers.map((t) => {
    let nextAtMs = t.nextAtMs;
    const everyMs = t.everyMs;
    const handlerFn = timeHandlerRegistry[t.handler];
    if (!handlerFn) return t;

    if (nextAtMs <= nextGameMs) {
      const times = Math.floor((nextGameMs - nextAtMs) / everyMs) + 1;
      nextState = handlerFn(nextState, { firedAtMs: nextAtMs, times });
      nextAtMs = nextAtMs + times * everyMs;
    }
    return { ...t, nextAtMs };
  });

  return { ...nextState, timeTriggers: updatedTriggers };
}
