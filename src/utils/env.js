/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
export function getEnv(key, fallback = '') {
  try {
    if (typeof window !== 'undefined' && window.__ENV && window.__ENV[key] !== undefined) {
      return window.__ENV[key];
    }
  } catch (e) {
    // ignore
  }

  try {
    // eslint-disable-next-line no-undef
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
      return process.env[key];
    }
  } catch (e) {
    // ignore
  }

  try {
    // eslint-disable-next-line no-undef
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
      return import.meta.env[key];
    }
  } catch (e) {
    // ignore
  }

  //Fallback
  return fallback;
}
