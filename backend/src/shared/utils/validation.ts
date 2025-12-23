/**
 * Validation Utilities
 * 
 * Common validation functions for data integrity.
 */

/**
 * Validate email format
 * 
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date format (YYYY-MM-DD)
 * 
 * @param date - Date string to validate
 * @returns True if valid date format
 */
export function validateDate(date: string | null | undefined): boolean {
  if (!date) return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Check if date is valid
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && parsedDate.toISOString().startsWith(date);
}

/**
 * Validate phone number format
 * 
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function validatePhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  
  // Accept international format with + and hyphens
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Validate country code (ISO 3166-1 alpha-2)
 * 
 * @param code - Country code to validate
 * @returns True if valid 2-letter country code
 */
export function validateCountryCode(code: string | null | undefined): boolean {
  if (!code) return false;
  return /^[A-Z]{2}$/.test(code);
}

/**
 * Validate URL format
 * 
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function validateUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate hex color code
 * 
 * @param color - Color code to validate
 * @returns True if valid hex color
 */
export function validateHexColor(color: string | null | undefined): boolean {
  if (!color) return false;
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Sanitize string for SQL/XSS prevention
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate string length
 * 
 * @param value - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns True if within length bounds
 */
export function validateLength(
  value: string | null | undefined,
  min: number,
  max: number
): boolean {
  if (!value) return false;
  return value.length >= min && value.length <= max;
}

/**
 * Validate number range
 * 
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if within range
 */
export function validateRange(
  value: number | null | undefined,
  min: number,
  max: number
): boolean {
  if (value === null || value === undefined) return false;
  return value >= min && value <= max;
}