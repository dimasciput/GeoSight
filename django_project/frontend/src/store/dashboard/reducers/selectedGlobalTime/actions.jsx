import {
  SELECTED_GLOBAL_TIME_ACTION_NAME,
  SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE_MIN_MAX
} from "./index";

/**
 * Change global time.
 * @param {object} min String of iso time to min.
 * @param {object} max String of iso time to max.
 */
export function change(min, max) {
  return {
    name: SELECTED_GLOBAL_TIME_ACTION_NAME,
    type: SELECTED_GLOBAL_TIME_ACTION_TYPE_CHANGE_MIN_MAX,
    payload: {
      min: min,
      max: max
    }
  };
}

export default {
  change
}