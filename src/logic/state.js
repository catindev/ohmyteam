const MINUTE_MS = 60 * 1000;

export default {
  pause: true,
  settings: { tick: 100 }, // мс реального тика
  ticks: 0,

  clock: {
    startEpochMs: Date.UTC(2025, 0, 1, 0, 0, 0),
    gameMs: 0,
  },

  budget: 50_000,

  // Персонажи
  characters: [
    {
      id: "c1",
      name: "Alice",
      stamina: 100,
      task: false,
      exhaustHours: 8,
      salary: 15,
    },
    {
      id: "c2",
      name: "Bob",
      stamina: 100,
      task: false,
      exhaustHours: 4,
      salary: 50,
    },
  ],

  // Реестр триггеров
  timeTriggers: [
    {
      id: "perMinute",
      everyMs: MINUTE_MS,
      nextAtMs: MINUTE_MS,
      handler: "onEachGameMinute",
    },
  ],

  // индикатор инцидентов (для UI/логов)
  incidents: [], // элементы: { id, type, message, atMs, payload? }
  incidentsVersion: 0, // монотонный счётчик для эффекта
};
