import { fetching } from "../reducers_api";

import {
  REFERENCE_LAYER_ACTION_NAME
} from '../reducers'

const REQUEST_REFERENCE_LAYER = 'REQUEST/' + REFERENCE_LAYER_ACTION_NAME;
const RECEIVE_REFERENCE_LAYER = 'RECEIVE/' + REFERENCE_LAYER_ACTION_NAME;

function request() {
  return {
    name: REFERENCE_LAYER_ACTION_NAME,
    type: REQUEST_REFERENCE_LAYER
  };
}

function receive(data, error = null) {
  return {
    name: REFERENCE_LAYER_ACTION_NAME,
    type: RECEIVE_REFERENCE_LAYER,
    data,
    error,
    receivedAt: Date.now()
  };
}

export function fetch(dispatch, url) {
  fetching(dispatch, url, {}, receive)
  return request();
}

export default {
  fetch
}