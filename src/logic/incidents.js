// Хелпер для работы с инцидентами.
// Формат записи:
// {
//   id: number,           // автоинкремент
//   atMs: number,         // текущее ИГРОВОЕ время (startEpochMs + gameMs)
//   type: string,         // 'payroll' | 'exhausted' | 'fully_restored' | ...
//   source: string,       // модуль-источник: 'payroll' | 'stamina' | ...
//   message: string,      // человекочитаемый текст
//   ...extraFields        // любые дополнительные поля (amount, count, characterId, ...)
// }

export function gameEpochMs(state) {
  return (state.clock?.startEpochMs ?? 0) + (state.clock?.gameMs ?? 0);
}

/**
 * Добавляет один инцидент и возвращает новый state
 * incident должен содержать хотя бы { type, message }
 */
export function appendIncident(state, incident, source) {
  const atMs = gameEpochMs(state);
  const id = (state.incidentsVersion ?? 0) + 1;

  const entry = {
    id,
    atMs,
    source,
    ...incident,
  };

  return {
    ...state,
    incidentsVersion: id,
    incidents: [...(state.incidents ?? []), entry],
  };
}

// Добавляет пачку инцидентов последовательно (с корректным id)
export function appendIncidents(state, incidents, source) {
  let next = state;
  for (const inc of incidents) {
    next = appendIncident(next, inc, source);
  }
  return next;
}
