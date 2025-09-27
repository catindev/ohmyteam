import { applyStamina } from "./stamina";

/**
 * Минутный обработчик игрового времени
 */
export function onMinuteTick(state, { times }) {
  let next = { ...state };

  // Единая точка изменения стамины вынесена в модуль stamina
  const { characters, incidents } = applyStamina(next.characters, {
    times,
    nowMs: next.clock.nowMs,
  });

  next.characters = characters;

  if (incidents.length) {
    next.incidents = [...(next.incidents || []), ...incidents];
    next.incidentsVersion = (next.incidentsVersion || 0) + incidents.length;
  }

  return next;
}

/**
 * Регистр обработчиков по именам — ожидается tick.js.
 * tick.js импортирует именно `timeHandlerRegistry`.
 */
export const timeHandlerRegistry = {
  onMinuteTick,
};

// (опционально) совместимость, если где-то в коде использовалось `handlers`
export const handlers = {
  onMinuteTick,
};
