/**
 * SELECTED_INDICATOR_LAYER_SECOND reducer
 */

export const SELECTED_INDICATOR_LAYER_SECOND_NAME = 'SELECTED_INDICATOR_LAYER_SECOND';
export const SELECTED_INDICATOR_LAYER_SECOND_ACTION_TYPE_CHANGE = 'SELECTED_INDICATOR_LAYER_SECOND/ADD';

const initialState = {}
export default function selectedIndicatorLayerSecondReducer(state = initialState, action) {
  if (action.name === SELECTED_INDICATOR_LAYER_SECOND_NAME) {
    switch (action.type) {
      case SELECTED_INDICATOR_LAYER_SECOND_ACTION_TYPE_CHANGE: {
        return {
          ...action.payload
        }
      }
    }
  }
  return state
}