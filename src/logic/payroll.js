// Логика расчёта зарплаты
// Списывает сумму salary всех персонажей из бюджета за один вызов триггера
// Ожидает, что у каждого персонажа есть salary, а в state есть budget

export function applyPayroll(state) {
  const characters = state.characters ?? [];
  if (characters.length === 0) return state;

  const stepCost = characters.reduce(
    (sum, ch) => sum + (Number(ch?.salary) || 0),
    0
  );

  if (!stepCost) return state;

  const currentBudget = Number(state.budget) || 0;
  const nextBudget = Math.max(0, currentBudget - stepCost);

  let nextState = {
    ...state,
    budget: nextBudget,
  };

  // необязательный, но полезный лог
  const message = `Payroll: -${stepCost}; бюджет → ${nextBudget}`;

  nextState = appendIncident(nextState, {
    type: "payroll",
    message: message,
    amount: -stepCost,
    count: characters.length,
  });

  return nextState;
}

function appendIncident(state, incident) {
  const incidentsVersion = (state.incidentsVersion ?? 0) + 1;
  const atMs = (state.clock?.startEpochMs ?? 0) + (state.clock?.gameMs ?? 0);

  const entry = { id: incidentsVersion, atMs, ...incident };

  return {
    ...state,
    incidentsVersion,
    incidents: [...(state.incidents ?? []), entry],
  };
}
