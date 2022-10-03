import {
  INDICATORS_DATA_ACTION_NAME,
  INDICATORS_DATA_ACTION_TYPE_STYLE
} from './index'
import { fetchingData } from "../../../../Requests";

/**
 * Requests data.
 * @param {object} id indicator ID.
 * @param {object} payload indicator.
 */
export const REQUEST_INDICATOR = 'REQUEST/' + INDICATORS_DATA_ACTION_NAME;
export const RECEIVE_INDICATOR = 'RECEIVE/' + INDICATORS_DATA_ACTION_NAME;

function request(id) {
  return {
    id: id,
    name: INDICATORS_DATA_ACTION_NAME,
    type: REQUEST_INDICATOR
  };
}

function receive(data, error, id, reporting_levels) {
  return {
    id: id,
    name: INDICATORS_DATA_ACTION_NAME,
    type: RECEIVE_INDICATOR,
    data,
    error,
    receivedAt: Date.now(),
    reporting_levels: reporting_levels,
  };
}


/**
 * Update style of indicator data.
 * @param {object} id indicator ID.
 * @param {object} rules Rules of data.
 */
export function updateStyle(id, rules) {
  return {
    name: INDICATORS_DATA_ACTION_NAME,
    type: INDICATORS_DATA_ACTION_TYPE_STYLE,
    id: id,
    rules: rules
  };
}

export function fetch(dispatch, id, url, reporting_levels) {
  fetchingData(
    url, {}, {}, function (response, error) {
      dispatch(
        receive(response, error, id, reporting_levels)
      )
    }
  )
  return request(id);
}

export default {
  fetch, updateStyle
}