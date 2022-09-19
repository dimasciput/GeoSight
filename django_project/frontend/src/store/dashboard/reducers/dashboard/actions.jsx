import { fetchingData } from "../../../../Requests";

import {
  DASHBOARD_ACTION_NAME,
  DASHBOARD_ACTION_TYPE_FILTERS_ALLOW_MODIFY,
  DASHBOARD_ACTION_TYPE_UPDATE,
  DASHBOARD_ACTION_TYPE_UPDATE_SHARE
} from './index'

const REQUEST_DASHBOARD = 'REQUEST/' + DASHBOARD_ACTION_NAME;
const RECEIVE_DASHBOARD = 'RECEIVE/' + DASHBOARD_ACTION_NAME;


/**
 * Request dashboard data.
 */
function request() {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: REQUEST_DASHBOARD
  };
}

/**
 * Receive response dashboard data.
 */
function receive(data, error = null) {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: RECEIVE_DASHBOARD,
    data,
    error,
    receivedAt: Date.now()
  };
}

/**
 * Fetching dashboard data.
 */
export function fetch(dispatch) {
  fetchingData(
    urls.dashboardData, {}, {}, function (response, error) {
      dispatch(
        receive(response, error)
      )
    }
  )
  return request();
}

/**
 * Update dashboard data.
 * @param {object} payload Dashboard data.
 */
export function update(payload) {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_UPDATE,
    payload: payload
  };
}

/**
 * Update dashboard permission.
 * @param {object} payload Dashboard permission.
 */
export function updatePermission(payload) {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_UPDATE_SHARE,
    payload: payload
  };
}

/**
 * Update filters allow modify.
 */
export function updateFiltersAllowModify() {
  return {
    name: DASHBOARD_ACTION_NAME,
    type: DASHBOARD_ACTION_TYPE_FILTERS_ALLOW_MODIFY
  };
}

export default {
  fetch, update, updateFiltersAllowModify, updatePermission
}