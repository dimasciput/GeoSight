import {
  SELECTED_BOOKMARK_NAME,
  SELECTED_BOOKMARK_TYPE_CHANGE
} from "./index";

/**
 * Change indicator.
 * @param {object} payload Indicator data.
 */
export function change(payload) {
  return {
    name: SELECTED_BOOKMARK_NAME,
    type: SELECTED_BOOKMARK_TYPE_CHANGE,
    payload: payload
  };
}

export default {
  change
}