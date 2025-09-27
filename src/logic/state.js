const MINUTE_MS = 60 * 1000;

export default {
  pause: true,
  settings: { tick: 100 }, // мс реального тика
  ticks: 0,

  clock: {
    startEpochMs: Date.UTC(2025, 0, 1, 0, 0, 0),
    gameMs: 0,
  },

  characters: [
    { id: "c1", name: "Alice", stamina: 100, task: false, exhaustHours: 8 },
    { id: "c2", name: "Bob", stamina: 100, task: false, exhaustHours: 4 },
  ],

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
