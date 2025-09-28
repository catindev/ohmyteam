import { applyStamina } from "./stamina";
import { applyPayroll } from "./payroll";

/* Обработчики игрового времени */

function onEachGameMinute(state, { times }) {
  let next = state;
  // Стамина у персонажей
  next = applyStamina(next, { times });
  return next;
}

function onEachGameHour(state, { times }) {
  let next = state;
  // Выплата зарплаты
  next = applyPayroll(next);
  return next;
}

// Реестр обработчиков
export const timeHandlerRegistry = {
  onEachGameMinute,
  onEachGameHour,
};
