/**
 * MAP_MODE reducer
 */

export const MAP_MODE_ACTION_NAME = 'MAP_MODE';
export const MAP_MODE_ACTION_TYPE_COMPARE_CHANGE = 'MAP_MODE/COMPARE_CHANGE';

const initialState = {
  compareMode: false
}
export default function mapCompareModeReducer(state = initialState, action) {
  if (action.name === MAP_MODE_ACTION_NAME) {
    switch (action.type) {
      case MAP_MODE_ACTION_TYPE_COMPARE_CHANGE: {
        return {
          ...state,
          compareMode: !state.compareMode
        }
      }
    }
  }
  return state
}