// помни: это чистые функции — никаких console.log тут!

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; // [min, max]
}

export function onMinuteTick(state, { times }) {
  // times — сколько игровых минут пролетело за один тик (обычно 1)
  let next = { ...state };
  let incidents = [];

  // сколько раз применить минутный шаг (если тик был «толстым»)
  for (let step = 0; step < times; step++) {
    const updatedChars = next.characters.map((ch) => {
      if (!ch.active || ch.stamina <= 0) return ch;

      const drop = randInt(1, 5);
      const newStamina = Math.max(0, ch.stamina - drop);

      if (newStamina === 0) {
        // формируем инцидент «персонаж устал»
        incidents.push({
          id: `tired:${ch.id}:${next.incidentsVersion + incidents.length + 1}`,
          type: "CHAR_TIRED",
          message: `${ch.name} устал и перестал работать`,
          atMs: next.clock.gameMs, // текущая игровая отметка ДО инкремента (нормально)
          payload: { charId: ch.id, name: ch.name },
        });
        return { ...ch, stamina: 0, active: false };
      }

      return { ...ch, stamina: newStamina };
    });

    next = { ...next, characters: updatedChars };
  }

  if (incidents.length > 0) {
    next = {
      ...next,
      incidents: [...next.incidents, ...incidents],
      incidentsVersion: next.incidentsVersion + incidents.length,
    };
  }

  return next;
}

// реестр обработчиков
export const timeHandlerRegistry = {
  onMinuteTick,
};
