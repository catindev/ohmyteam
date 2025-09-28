// Публичный API:
// - applyStamina(state, { times }) -> nextState
// - getQuartile(stamina) -> 1..4
//
// Параметры персонажа:
//   - exhaustHours: часы до полного выматывания (100 -> 0) при непрерывной работе
//   - recoverHours: часы до полного восстановления (0 -> 100) при непрерывном отдыхе

import { appendIncident } from "./incidents";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const getQuartile = (stamina) => {
  if (stamina >= 75) return 4;
  if (stamina >= 50) return 3;
  if (stamina >= 25) return 2;
  return 1;
};

// Множители по четвертям
const WORK_MULTIPLIER = { 4: 1, 3: 2, 2: 3, 1: 4 };
const REST_MULTIPLIER = { 1: 1, 2: 2, 3: 3, 4: 4 };

// Дефолты (если у персонажа не задано явно)
const DEFAULT_EXHAUST_HOURS = 4;
const DEFAULT_RECOVER_HOURS = 4;

/**
 * Базовая скорость (ед/мин) так, чтобы пройти 100 ед. за H часов
 * с учётом множителей по квартилям:
 *   T = sum_q (25 / (rate * mult_q))  =>  rate = 25 * sum_q(1/mult_q) / (H * 60)
 */
function baseRatePerMinute(totalHours, multiplierByQuartile) {
  const inverseMultiplierSum =
    1 / multiplierByQuartile[4] +
    1 / multiplierByQuartile[3] +
    1 / multiplierByQuartile[2] +
    1 / multiplierByQuartile[1];

  return (25 * inverseMultiplierSum) / (totalHours * 60);
}

/**
 * Применяет логику стамины к общему стейту. Возвращает новый state.
 * @param {Object} state
 * @param {{times:number}} options - сколько игровых минут прошло (целое >=1)
 */
export function applyStamina(state, { times }) {
  if (!times || times <= 0) return state;

  let nextState = {
    ...state,
    characters: state.characters.map((character) => ({ ...character })),
  };

  // поминутные шаги — квартиль может меняться по ходу
  for (let minuteIndex = 0; minuteIndex < times; minuteIndex++) {
    for (let index = 0; index < nextState.characters.length; index++) {
      const character = nextState.characters[index];

      const quartile = getQuartile(character.stamina);

      const exhaustHours =
        Number(character.exhaustHours) > 0
          ? Number(character.exhaustHours)
          : DEFAULT_EXHAUST_HOURS;

      const recoverHours =
        Number(character.recoverHours) > 0
          ? Number(character.recoverHours)
          : DEFAULT_RECOVER_HOURS;

      const workBaseRate = baseRatePerMinute(exhaustHours, WORK_MULTIPLIER); // ед/мин
      const restBaseRate = baseRatePerMinute(recoverHours, REST_MULTIPLIER); // ед/мин

      const deltaPerMinute = character.task
        ? -workBaseRate * WORK_MULTIPLIER[quartile]
        : restBaseRate * REST_MULTIPLIER[quartile];

      const prevStamina = character.stamina;
      const nextStamina = clamp(prevStamina + deltaPerMinute, 0, 100);

      if (nextStamina !== prevStamina) {
        character.stamina = nextStamina;

        // события на порогах
        if (nextStamina === 0 && prevStamina > 0) {
          nextState = appendIncident(
            nextState,
            {
              type: "exhausted",
              characterId: character.id,
              message: `${character.name} вымотан(а) до нуля.`,
            },
            "stamina"
          );
        }
        if (!character.task && nextStamina === 100 && prevStamina < 100) {
          nextState = appendIncident(
            nextState,
            {
              type: "restored",
              characterId: character.id,
              message: `${character.name} полностью восстановил(а) силы.`,
            },
            "stamina"
          );
        }
      }
    }
  }

  return nextState;
}
