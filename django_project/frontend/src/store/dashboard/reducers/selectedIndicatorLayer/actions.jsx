import {
  SELECTED_INDICATOR_LAYER_ACTION_TYPE_CHANGE,
  SELECTED_INDICATOR_LAYER_NAME,
} from './index'

/**
 * Change indicator.
 * @param {object} payload Indicator data.
 */
export function change(payload) {
  return {
    name: SELECTED_INDICATOR_LAYER_NAME,
    type: SELECTED_INDICATOR_LAYER_ACTION_TYPE_CHANGE,
    payload: payload
  };
}

export default {
  change
}