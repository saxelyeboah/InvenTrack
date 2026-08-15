/**
 * InvenTrack Input Sanitization and Validation Utilities
 */

// Strip HTML tags and dangerous characters to prevent XSS / Injection
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/[\0\x08\x09\x1a\n\r"'\\%]/g, (char) => {
      switch (char) {
        case '\0': return '';
        case '\n': return ' ';
        case '\r': return ' ';
        case '"': return '&quot;';
        case "'": return '&#39;';
        case '\\': return '';
        default: return char;
      }
    })
    .trim();
};

// Validate standard email format
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// Validate phone numbers (allows digits, +, -, spaces; rejects alphabetic letters)
const isValidPhone = (phone) => {
  if (!phone) return true; // Optional field
  if (typeof phone !== 'string') return false;
  const cleaned = phone.trim();
  if (cleaned.length === 0) return true;
  // Rejects any letters (a-z, A-Z)
  if (/[a-zA-Z]/.test(cleaned)) return false;
  // Must match phone number format (8 to 20 chars of +, -, digits, spaces, parens)
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  return phoneRegex.test(cleaned);
};

// Validate positive numbers (e.g. price > 0)
const isPositiveNumber = (val) => {
  const num = Number(val);
  return !isNaN(num) && isFinite(num) && num > 0;
};

// Validate non-negative numbers (e.g. stock quantity >= 0)
const isNonNegativeInteger = (val) => {
  const num = Number(val);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
};

// Validate positive integers (e.g. item count > 0)
const isPositiveInteger = (val) => {
  const num = Number(val);
  return !isNaN(num) && Number.isInteger(num) && num > 0;
};

// Sanitize SKU codes (alphanumeric, uppercase, dashes/underscores only)
const sanitizeSku = (sku) => {
  if (typeof sku !== 'string') return '';
  return sku.toUpperCase().replace(/[^A-Z0-9\-_]/g, '').trim();
};

module.exports = {
  sanitizeString,
  isValidEmail,
  isValidPhone,
  isPositiveNumber,
  isNonNegativeInteger,
  isPositiveInteger,
  sanitizeSku,
};
