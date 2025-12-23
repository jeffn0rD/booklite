/**
 * Formatting Utilities
 * 
 * Functions for formatting data for display and processing.
 */

/**
 * Format date to ISO string (YYYY-MM-DD)
 * 
 * @param date - Date object or string
 * @returns ISO date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format timestamp to ISO string
 * 
 * @param date - Date object or string
 * @returns ISO timestamp string
 */
export function formatTimestamp(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Generate document number
 * 
 * @param prefix - Document prefix (e.g., "INV", "QTE")
 * @param nextNumber - Next sequential number
 * @returns Formatted document number (e.g., "INV-001")
 */
export function generateDocumentNumber(prefix: string, nextNumber: number): string {
  const paddedNumber = String(nextNumber).padStart(3, '0');
  return `${prefix}-${paddedNumber}`;
}

/**
 * Calculate due date from issue date and payment terms
 * 
 * @param issueDate - Issue date string (YYYY-MM-DD)
 * @param paymentTermsDays - Number of days for payment
 * @returns Due date string (YYYY-MM-DD)
 */
export function calculateDueDate(issueDate: string, paymentTermsDays: number): string {
  const issue = new Date(issueDate);
  const due = new Date(issue);
  due.setDate(due.getDate() + paymentTermsDays);
  return formatDate(due);
}

/**
 * Parse cursor for pagination
 * 
 * @param cursor - Base64 encoded cursor
 * @returns Decoded cursor object
 */
export function parseCursor(cursor: string): Record<string, any> {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

/**
 * Encode cursor for pagination
 * 
 * @param data - Cursor data object
 * @returns Base64 encoded cursor
 */
export function encodeCursor(data: Record<string, any>): string {
  const json = JSON.stringify(data);
  return Buffer.from(json, 'utf-8').toString('base64');
}

/**
 * Format phone number for display
 * 
 * @param phone - Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as +1-XXX-XXX-XXXX for US numbers
  if (digits.length === 10) {
    return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  
  // Return original if not standard format
  return phone;
}

/**
 * Truncate string with ellipsis
 * 
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Generate random string for IDs
 * 
 * @param length - Length of string
 * @returns Random string
 */
export function generateRandomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}