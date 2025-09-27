const MINUTE_MS = 60 * 1000;

export default {
  pause: false,
  settings: { tick: 100 }, // мс реального тика
  ticks: 0,

  clock: {
    startEpochMs: Date.UTC(2025, 0, 1, 0, 0, 0),
    gameMs: 0,
  },

  characters: [
    { id: "c1", name: "Worker 1", stamina: 100, active: true },
    { id: "c2", name: "Worker 2", stamina: 100, active: true },
  ],

  // временные триггеры: «каждую минуту»
  timeTriggers: [
    {
      id: "perMinute",
      everyMs: MINUTE_MS,
      nextAtMs: MINUTE_MS,
      handler: "onMinuteTick",
    },
  ],

  // индикатор инцидентов (для UI/логов)
  incidents: [], // элементы: { id, type, message, atMs, payload? }
  incidentsVersion: 0, // монотонный счётчик для эффекта
};
