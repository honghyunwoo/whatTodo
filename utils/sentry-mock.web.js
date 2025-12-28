/**
 * Empty mock for @sentry/react-native on web
 * This prevents import.meta errors from the actual library
 */

export function init() {}
export function setUser() {}
export function setTag() {}
export function setExtras() {}
export function captureException() {}
export function captureMessage() {}
export function addBreadcrumb() {}

export const Sentry = {
  init,
  setUser,
  setTag,
  setExtras,
  captureException,
  captureMessage,
  addBreadcrumb,
};

export default Sentry;
