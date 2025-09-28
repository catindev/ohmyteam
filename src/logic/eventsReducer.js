import { tickEvent, pauseEvent, resetEvent } from "./game";
import { toggleTaskEvent } from "./characters";

export default function gameEventsReducer(state, action) {
  switch (action.type) {
    case "TICK":
      return tickEvent(state);

    case "PAUSE":
      return pauseEvent(state);

    case "RESET":
      return resetEvent(state);

    case "TOGGLE_TASK":
      return toggleTaskEvent(state, action);

    default:
      return state;
  }
}
