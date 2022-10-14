/**
 * GLOBAL_TIME reducer
 */

export const SELECTED_GLOBAL_TIME_ACTION_NAME = 'GLOBAL_TIME';
export const SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE_MIN_MAX = 'GLOBAL_TIME/CHANGE_MIN_MAX';

const initialState = {
  min: null,
  max: null
}
export default function selectedGlobalTimeReducer(state = initialState, action) {
  if (action.name === SELECTED_GLOBAL_TIME_ACTION_NAME) {
    switch (action.type) {
      case SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE_MIN_MAX: {
        const { min, max } = action.payload
        return {
          min: min,
          max: max
        }
      }
    }
  }
  return state
}