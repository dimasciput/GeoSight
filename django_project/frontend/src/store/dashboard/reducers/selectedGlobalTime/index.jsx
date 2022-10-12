/**
 * GLOBAL_TIME reducer
 */

export const SELECTED_GLOBAL_TIME_ACTION_NAME = 'GLOBAL_TIME';
export const SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE = 'GLOBAL_TIME/CHANGE';

const initialState = ""
export default function selectedGlobalTimeReducer(state = initialState, action) {
  if (action.name === SELECTED_GLOBAL_TIME_ACTION_NAME) {
    switch (action.type) {
      case SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE: {
        return action.payload
      }
    }
  }
  return state
}