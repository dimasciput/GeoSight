import {
  SELECTED_INDICATOR_ACTION_TYPE_CHANGE,
  SELECTED_INDICATOR_NAME,
} from './index'

/**
 * Change indicator.
 * @param {object} payload Indicator data.
 */
export function change(payload) {
  return {
    name: SELECTED_INDICATOR_NAME,
    type: SELECTED_INDICATOR_ACTION_TYPE_CHANGE,
    payload: payload
  };
}

export default {
  change
}