import DOMPurify from 'dompurify';

export function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  // Allow only plain text 
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
}
