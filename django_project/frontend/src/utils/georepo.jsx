import { fetchJSON } from '../Requests'

/** Georepo URL */


function updateToken(url) {
  if (preferences.georepo_api_key) {
    const urls = url.split('?')
    let parameters = urls[1] ? urls[1].split('&') : []
    parameters.unshift('token=' + preferences.georepo_api_key)
    urls[1] = parameters.join('&')
    url = urls.join('?')
  }
  return url
}

export const GeorepoUrls = {
  WithDomain: function (url) {
    return updateToken(preferences.georepo_api.domain + url)
  },
  ReferenceList: updateToken(
    preferences.georepo_api.reference_layer_list
  ),
  ReferenceDetail: function (identifier) {
    return updateToken(
      preferences.georepo_api.reference_layer_detail.replace('<identifier>', identifier)
    )
  }
}

export const fetchGeojson = async function (url, useCache = true) {
  let data = []
  const _fetchGeojson = async function (page = 1) {
    try {
      const response = await fetchJSON(url + '?page=' + page, {}, useCache);
      if (response.results.features) {
        data = data.concat(response.results.features)
        if (response.results.features.length) {
          await _fetchGeojson(page += 1)
        }
      }
    } catch (error) {
    }
  }
  await _fetchGeojson()
  return data
}
export const fetchFeatureList = async function (url, useCache = true) {
  let data = []
  const _fetchGeojson = async function (page = 1) {
    try {
      const response = await fetchJSON(url + '?cache=false&page=' + page, {}, useCache);
      if (response.results) {
        data = data.concat(response.results)
        if (response.results.length) {
          await _fetchGeojson(page += 1)
        }
      }
    } catch (error) {
    }
  }
  await _fetchGeojson()
  return data
}