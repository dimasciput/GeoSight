'use strict';

import i18n from "i18next";

/**
 * Getting cookie function
 * @param cname
 * @returns {string}
 */
export function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/**
 * Set a cookie function *
 * @param cname
 * @param cvalue
 * @param exdays
 */
export function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
}

/**
 * Deep copy of dictionary
 */
export function dictDeepCopy(dict) {
  return JSON.parse(JSON.stringify(dict))
}


/**
 * return translation of message
 * mostly for checking if the sentences has incorrect character
 *
 * @param sentence : string
 */
export function translate(sentence) {
  if (sentence === undefined) {
    return sentence
  }

  sentence = sentence.replace('https://', '')
  // split with ':'
  const newSentences = sentence.split(':').map(val => {
    const cleanSentence = val.replace(/ +(?= )/g, '')
    return i18n.t(cleanSentence.trim())
  })
  return newSentences.join(': ')
}

/**
 * Delays the execution in x milliseconds.
 *
 * @param {int} millis Milliseconds
 */
export function delay(millis) {
  return new Promise(resolve => {
    setTimeout(resolve, millis);
  });
}


/**
 * Return number with commas
 */
export function numberWithCommas(x, decimalNum = 2) {
  if (x === null) {
    return '';
  } else if (isNaN(x)) {
    return x;
  } else {
    let numFloat = parseFloat(x);
    if (!isNaN(numFloat)) {
      x = numFloat;
    } else {
      return x
    }
    if (typeof x !== 'number') {
      return x
    }
    x = x.toFixed(decimalNum)
    let number = x.split('.')[0];
    let decimal = x.split('.')[1];
    let string = number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decimal && parseInt(decimal)) {
      string += '.' + decimal.replace(/[0]+$/, '');
    }
    return string;
  }
}

/**
 * Capitalize a string
 * @param target
 * @returns {string}
 */
export function capitalize(target) {
  return (target.charAt(0).toUpperCase() + target.slice(1)).replaceAll('_', ' ');
}

/**
 * JSON TO PARAMS
 */
export function jsonToUrlParams(object) {
  const params = []
  for (const [key, value] of Object.entries(object)) {
    params.push(`${key}=${value}`)
  }
  return params.join('&')
}

/***
 * Hex to RGBA
 */
export function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha !== undefined) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}

/*** Return url params */
export function urlParams(url) {
  if (!url) {
    url = window.location.href
  }
  const urls = url.split('?')

  if (urls[1]) {
    const parameters = urls[1].split('&')
    const paramDict = {}
    parameters.map(param => {
      const splitParam = param.split('=')
      paramDict[splitParam[0]] = splitParam.slice(1).join('=')
    })
    return paramDict
  } else {
    return {}
  }
}

// ----------------------------------------------------------------------
// LEAFLET POPUP
// ----------------------------------------------------------------------
/**
 * Returning popup html just for header
 * @param {string} title Title of data
 * @param {object} properties Properties that will be rendered
 */
export function featurePopupContentHeader(title, properties) {
  let color = '#eee';
  for (const [key, prop] of Object.entries(properties)) {
    if (key.toLowerCase() === 'color') {
      color = prop
    }
  }
  return `<div class="table__header" style="background: ${color}"><b>${title}</b></div>`
}

/**
 * Returning popup html just for properties table
 * @param {string} title Title of data
 * @param {object} properties Properties that will be rendered
 * @param {string} className Classname for this popup
 */
export function featurePopupContentPropertiesTable(title, properties, className) {
  let defaultHtml = '';
  for (const [key, prop] of Object.entries(properties)) {
    if (!['color', 'outline_color', 'detail_url'].includes(key.toLowerCase())) {
      let value = numberWithCommas(prop)
      if (prop) {
        if (typeof prop === 'object') {
          if (Object.keys(prop)) {
            value = JSON.stringify(prop)
          }
        }
      }
      defaultHtml += `<tr><td valign="top"><b>${capitalize(key)}</b></td><td valign="top">${value}</td></tr>`
    }
  }
  if (properties.detail_url) {
    defaultHtml += '<tr><td colspan="2" style="padding: 5px"><button data-url="' + properties.detail_url + '" data-name="' + properties.name + '" class="popup-details MuiButtonLike" style="width: 100%;" disabled>Details</button></tr>'
  }
  return `<div class="table__content ${className ? className : ''}"><table><tbody>${defaultHtml}</tbody></table></div>`
}

/**
 * Returning popup html
 * @param {string} title Title of data
 * @param {object} properties Properties that will be rendered
 */
export function featurePopupContent(title, properties, className) {
  return featurePopupContentHeader(title, properties) + featurePopupContentPropertiesTable(title, properties, className)
}

/**
 * Change string to singular
 */
export function toSingular(str) {
  let singularStr = str
  if (str[str.length - 1] === 's') {
    singularStr = singularStr.substring(0, singularStr.length - 1);
  }
  return singularStr
}

/**
 * Json to xls
 * @param {Array} data Array of object.
 * @param {string} filename Filename of json
 * @param {string} sheetName Sheet name
 */
export function jsonToXlsx(data, filename, sheetName = "Sheet 1") {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  worksheet["!cols"] = Object.keys(data[0]).map(key => {
    return { wch: data.reduce((w, r) => Math.max(w, r[key].length), 10) }
  });
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, filename);
}

/**
 * Json to xls
 * @param {Date} d
 */
export function formatDate(d, reverseDate = false) {
  let month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;
  if (reverseDate) {
    return [day, month, year].join('-');
  } else {
    return [year, month, day].join('-');
  }
}

/**
 * Json to xls
 * @param {Date} d
 */
export function formatDateTime(d, reverseDate = false) {
  let month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
    hour = '' + d.getHours(),
    minute = '' + d.getMinutes(),
    second = '' + d.getSeconds();
  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;
  if (hour.length < 2)
    hour = '0' + hour;
  if (minute.length < 2)
    minute = '0' + minute;
  if (second.length < 2)
    second = '0' + second;

  if (reverseDate) {
    return [day, month, year].join('-') + ' ' + [hour, minute, second].join(':');
  } else {
    return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':');
  }
}