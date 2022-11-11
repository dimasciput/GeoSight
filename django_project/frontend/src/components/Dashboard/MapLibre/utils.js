import maplibregl from 'maplibre-gl';

/**
 * Return if layer exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const hasLayer = (map, id) => {
  return typeof map.getLayer(id) !== 'undefined'
}

/**
 * Return if layer exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const removeLayer = (map, id) => {
  if (hasLayer(map, id)) {
    map.removeLayer(id)
  }
}

/**
 * Return if source exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const hasSource = (map, id) => {
  return typeof map.getSource(id) !== 'undefined'
}
/**
 * Return if source exist or not
 * @param {Object} map Map
 * @param {String} id of layer
 */
export const removeSource = (map, id) => {
  if (typeof map.getSource(id) !== 'undefined') {
    map.removeSource(id);
  }
}

/**
 * Load image to map
 */
export const loadImageToMap = (map, id, callback) => {
  if (map.listImages().includes(id)) {
    map.removeImage(id)
  }
  map.loadImage(
    id,
    function (error, image) {
      if (!error) {
        map.addImage(id, image);
      }
      callback(error, image)
    }
  );
}

/**
 * Update cursor on hovered
 */
const updateCursorOnHovered = (map) => {
  if (map.measurementMode) {
    map.getCanvas().style.cursor = 'crosshair';
  } else {
    map.getCanvas().style.cursor = 'pointer';
  }
}

/**
 * Update cursor on hovered
 */
const updateCursorOnLeave = (map) => {
  if (map.measurementMode) {
    map.getCanvas().style.cursor = 'crosshair';
  } else {
    map.getCanvas().style.cursor = '';
  }
}
/***
 * Add popup when click
 */
let popup = null
export const addPopup = (map, id, popupRenderFn) => {
  map.on('mouseenter', id, function (e) {
    updateCursorOnHovered(map)
  });

  map.on('mouseleave', id, function () {
    updateCursorOnLeave(map)
  });

  map.on('click', id, function (e) {
    if (!map.measurementMode) {
      const popupHtml = popupRenderFn(e.features[0].properties)
      if (popup) {
        popup.remove()
      }
      popup = new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popupHtml)
        .addTo(map);
    }
  });
}
/**
 * Popup for marker
 */
export const addPopupEl = (map, el, latlng, properties, popupRenderFn, offset = {}) => {
  el.addEventListener('mouseenter', function (e) {
    updateCursorOnHovered(map)
  });

  el.addEventListener('mouseleave', function () {
    updateCursorOnLeave(map)
  });

  el.addEventListener('click', function (e) {
    if (!map.measurementMode) {
      const popupHtml = popupRenderFn(properties)
      if (popup) {
        popup.remove()
      }
      popup = new maplibregl.Popup({ offset: offset })
        .setLngLat(latlng)
        .setHTML(popupHtml)
        .addTo(map);
    }
  });
}