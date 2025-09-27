// Публичный API:
// - applyStamina(characters, { times, nowMs }) -> { characters, incidents }
// - getQuartile(stamina) -> 1..4

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const getQuartile = (stamina) => {
  if (stamina >= 75) return 4;
  if (stamina >= 50) return 3;
  if (stamina >= 25) return 2;
  return 1;
};

// Множители по четвертям — быстрее к низким квартилям при работе
const WORK_MULT = { 4: 1, 3: 2, 2: 3, 1: 4 };
// Для отдыха — обратная динамика (медленно внизу, быстрее вверху)
const REST_MULT = { 1: 1, 2: 2, 3: 3, 4: 4 };

// Гармоническая сумма множителей (1 + 1/2 + 1/3 + 1/4)
const HARM4 = 1 + 1 / 2 + 1 / 3 + 1 / 4; // 2.083333333333333

// По умолчанию без параметров персонажа:
// - полное выматывание при непрерывной работе за 4 часа
// - полное восстановление при непрерывном отдыхе за 4 часа
const DEFAULT_EXHAUST_HOURS = 4;
const DEFAULT_RECOVER_HOURS = 4;

/**
 * Рассчитывает базовую скорость (единиц стамины в минуту) так, чтобы пройти все 4 четверти за H часов
 * при указанных множителях по четвертям.
 * T(часы) = (25 / r) * Σ(1 / m_q) / 60  =>  r = 25 * Σ(1 / m_q) / (H * 60)
 */
function baseRatePerMinute(totalHours, multByQuart) {
  const sumInvMult =
    1 / multByQuart[4] +
    1 / multByQuart[3] +
    1 / multByQuart[2] +
    1 / multByQuart[1];
  return (25 * sumInvMult) / (totalHours * 60);
}

/**
 * Идемпотентно применяет изменение стамины поминутно
 */
export function applyStamina(characters, { times, nowMs }) {
  const nextChars = characters.map((c) => ({ ...c }));
  const incidents = [];

  for (let step = 0; step < times; step++) {
    for (let i = 0; i < nextChars.length; i++) {
      const ch = nextChars[i];

      const q = getQuartile(ch.stamina);

      // Базовые скорости под конкретного персонажа
      const exhaustHours =
        Number(ch.exhaustHours) > 0
          ? Number(ch.exhaustHours)
          : DEFAULT_EXHAUST_HOURS;
      const recoverHours =
        Number(ch.recoverHours) > 0
          ? Number(ch.recoverHours)
          : DEFAULT_RECOVER_HOURS;

      const workBase = baseRatePerMinute(exhaustHours, WORK_MULT); // ед/мин
      const restBase = baseRatePerMinute(recoverHours, REST_MULT); // ед/мин

      // Дельта за одну "игровую минуту" в текущей четверти
      const delta = ch.task
        ? -workBase * WORK_MULT[q]
        : restBase * REST_MULT[q];

      const prev = ch.stamina;
      const val = clamp(prev + delta, 0, 100);

      if (val !== prev) {
        ch.stamina = val;

        // опциональные события
        if (val === 0 && prev > 0) {
          incidents.push({
            ts: nowMs,
            type: "exhausted",
            characterId: ch.id,
            message: `${ch.name} вымотан(а) до нуля.`,
          });
        }
        if (!ch.task && val === 100 && prev < 100) {
          incidents.push({
            ts: nowMs,
            type: "fully_restored",
            characterId: ch.id,
            message: `${ch.name} полностью восстановил(а) силы.`,
          });
        }
      }
    }
  }

  return { characters: nextChars, incidents };
}
