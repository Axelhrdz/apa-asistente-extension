/**
 * @param {string} key
 * @returns {string}
 */
export function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}
