import {
  SELECTED_GLOBAL_TIME_ACTION_NAME,
  SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE
} from "./index";

/**
 * Change global time.
 * @param {object} payload String of iso time.
 */
export function change(payload) {
  return {
    name: SELECTED_GLOBAL_TIME_ACTION_NAME,
    type: SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE,
    payload: payload
  };
}

export default {
  change
}