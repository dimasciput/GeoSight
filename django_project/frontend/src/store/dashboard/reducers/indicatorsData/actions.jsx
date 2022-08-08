import { INDICATORS_DATA_ACTION_NAME } from './index'
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

function receive(data, error, id, reporting_level) {
  return {
    id: id,
    name: INDICATORS_DATA_ACTION_NAME,
    type: RECEIVE_INDICATOR,
    data,
    error,
    receivedAt: Date.now(),
    reporting_level: reporting_level
  };
}

export function fetch(dispatch, id, url, reporting_level) {
  fetchingData(
    url, {}, {}, function (response, error) {
      dispatch(
        receive(response, error, id, reporting_level)
      )
    }
  )
  return request(id);
}

export default {
  fetch
}