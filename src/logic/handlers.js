import { applyStamina } from "./stamina";
import { applyPayroll } from "./payroll";

// Ежеминутный обработчик игрового времени
export function onEachGameMinute(state, { times }) {
  let next = state;
  // 1) Стамина у персонажей
  next = applyStamina(next, { times });
  // 2) Выплата зарплаты
  next = applyPayroll(next);
  return next;
}

// Реестр обработчиков
export const timeHandlerRegistry = {
  onEachGameMinute,
};
