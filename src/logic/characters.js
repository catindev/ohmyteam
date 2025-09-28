//import { appendIncident } from "./incidents";

export function toggleTaskEvent(state, action) {
  const { id } = action.payload;
  return {
    ...state,
    characters: state.characters.map((character) =>
      character.id === id ? { ...character, task: !character.task } : character
    ),
  };
}
