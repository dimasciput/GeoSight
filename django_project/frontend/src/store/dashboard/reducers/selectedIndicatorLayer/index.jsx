/**
 * SELECTED_INDICATOR_LAYER reducer
 */

export const SELECTED_INDICATOR_LAYER_NAME = 'SELECTED_INDICATOR_LAYER';
export const SELECTED_INDICATOR_LAYER_ACTION_TYPE_CHANGE = 'SELECTED_INDICATOR_LAYER/ADD';

const initialState = {}
export default function selectedIndicatorLayerReducer(state = initialState, action) {
  if (action.name === SELECTED_INDICATOR_LAYER_NAME) {
    switch (action.type) {
      case SELECTED_INDICATOR_LAYER_ACTION_TYPE_CHANGE: {
        return {
          ...action.payload
        }
      }
    }
  }
  return state
}