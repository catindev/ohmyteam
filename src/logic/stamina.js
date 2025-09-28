// Публичный API:
// - applyStamina(state, { times }) -> nextState
// - getQuartile(stamina) -> 1..4

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export const getQuartile = (stamina) => {
  if (stamina >= 75) return 4;
  if (stamina >= 50) return 3;
  if (stamina >= 25) return 2;
  return 1;
};

// Множители по четвертям
const WORK_MULT = { 4: 1, 3: 2, 2: 3, 1: 4 };
const REST_MULT = { 1: 1, 2: 2, 3: 3, 4: 4 };

// Дефолты: полное выматывание/восстановление за N игровых часов
const DEFAULT_EXHAUST_HOURS = 4;
const DEFAULT_RECOVER_HOURS = 4;

/**
 * Базовая скорость (ед/мин) так, чтобы пройти 100 ед. за H часов
 * с учётом множителей по квартилям:
 *   T = sum_q (25 / (r * mult_q))  =>  r = 25 * sum_q(1/mult_q) / (H * 60)
 */
function baseRatePerMinute(totalHours, multByQuart) {
  const sumInv =
    1 / multByQuart[4] +
    1 / multByQuart[3] +
    1 / multByQuart[2] +
    1 / multByQuart[1];
  return (25 * sumInv) / (totalHours * 60);
}

/**
 * Применяет логику стамины к общему стейту.
 * Добавляет инциденты и увеличивает incidentsVersion.
 * @param {Object} state
 * @param {{times:number}} opts - сколько игровых минут прошло (целое >=1)
 * @returns {Object} nextState
 */
export function applyStamina(state, { times }) {
  if (!times || times <= 0) return state;

  // иммутабельные копии
  const next = {
    ...state,
    characters: state.characters.map((c) => ({ ...c })),
  };

  const incidents = [];
  const nowMs = (state.clock?.startEpochMs ?? 0) + (state.clock?.gameMs ?? 0);

  // поминутные шаги — квартиль может меняться по ходу
  for (let step = 0; step < times; step++) {
    for (let i = 0; i < next.characters.length; i++) {
      const character = next.characters[i];

      const quartile = getQuartile(character.stamina);

      const exhaustHours =
        Number(character.exhaustHours) > 0
          ? Number(character.exhaustHours)
          : DEFAULT_EXHAUST_HOURS;
      const recoverHours =
        Number(character.recoverHours) > 0
          ? Number(character.recoverHours)
          : DEFAULT_RECOVER_HOURS;

      const workBase = baseRatePerMinute(exhaustHours, WORK_MULT); // ед/мин
      const restBase = baseRatePerMinute(recoverHours, REST_MULT); // ед/мин

      const delta = character.task
        ? -workBase * WORK_MULT[quartile]
        : restBase * REST_MULT[quartile];

      const prev = character.stamina;
      const val = clamp(prev + delta, 0, 100);

      if (val !== prev) {
        character.stamina = val;

        // события на порогах (опционально)
        if (val === 0 && prev > 0) {
          incidents.push({
            ts: nowMs,
            type: "exhausted",
            characterId: character.id,
            message: `${character.name} вымотан(а) до нуля.`,
          });
        }
        if (!character.task && val === 100 && prev < 100) {
          incidents.push({
            ts: nowMs,
            type: "fully_restored",
            characterId: character.id,
            message: `${character.name} полностью восстановил(а) силы.`,
          });
        }
      }
    }
  }

  if (incidents.length) {
    next.incidents = [...(next.incidents || []), ...incidents];
    next.incidentsVersion = (next.incidentsVersion || 0) + incidents.length;
  }

  return next;
}
