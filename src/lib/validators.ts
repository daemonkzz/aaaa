/**
 * Validate Discord ID format (numeric, 17-19 digits)
 */
export const isValidDiscordId = (id: string): boolean => {
  if (!id) return false;
  return /^\d{17,19}$/.test(id.trim());
};

/**
 * Validate Steam ID format (steam_0:X:XXXXXXXX or STEAM_0:X:XXXXXXXX)
 */
export const isValidSteamId = (id: string): boolean => {
  if (!id) return false;
  // STEAM_X:Y:Z format
  const steam2Regex = /^STEAM_[0-5]:[0-1]:\d+$/i;
  // steam64 format (17 digits)
  const steam64Regex = /^7656119\d{10}$/;
  // hex format
  const hexRegex = /^[0-9a-fA-F]{16}$/;
  
  return steam2Regex.test(id.trim()) || steam64Regex.test(id.trim()) || hexRegex.test(id.trim());
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number (Turkish format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  // Turkish phone number format: 05XX XXX XX XX or +90 5XX XXX XX XX
  return /^(\+90|0)?5\d{9}$/.test(cleaned);
};

/**
 * Validate minimum length
 */
export const hasMinLength = (value: string, min: number): boolean => {
  return value.trim().length >= min;
};

/**
 * Validate maximum length
 */
export const hasMaxLength = (value: string, max: number): boolean => {
  return value.trim().length <= max;
};

/**
 * Validate that value is not empty
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate age (between min and max)
 */
export const isValidAge = (age: number, min = 1, max = 120): boolean => {
  return Number.isInteger(age) && age >= min && age <= max;
};

/**
 * Normalize string array from unknown type
 */
export const normalizeStringArray = (value: unknown): string[] | null => {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string') return [value];
  return null;
};

/**
 * Normalize string record from unknown type
 */
export const normalizeStringRecord = (value: unknown): Record<string, string> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, v]) => typeof v === 'string'
  );
  return Object.fromEntries(entries) as Record<string, string>;
};
