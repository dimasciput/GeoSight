/**
 * SELECTED_INDICATOR reducer
 */

export const SELECTED_INDICATOR_NAME = 'SELECTED_INDICATOR';
export const SELECTED_INDICATOR_ACTION_TYPE_CHANGE = 'SELECTED_INDICATOR/ADD';

const initialState = {}
export default function selectedIndicatorReducer(state = initialState, action) {
  if (action.name === SELECTED_INDICATOR_NAME) {
    switch (action.type) {
      case SELECTED_INDICATOR_ACTION_TYPE_CHANGE: {
        return {
          ...action.payload
        }
      }
    }
  }
  return state
}