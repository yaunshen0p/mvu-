/**
 * Validation utilities for settings and user input
 */

export interface HeaderValidationResult {
  valid: boolean
  headers?: Record<string, string>
  error?: string
}

/**
 * Validates and parses custom headers JSON input
 * @param input - Raw JSON string input from user
 * @returns Validation result with parsed headers or error message
 */
export function validateHeaders(input: string): HeaderValidationResult {
  const trimmed = input.trim()
  
  if (!trimmed) {
    return { valid: true, headers: {} }
  }
  
  try {
    const parsed = JSON.parse(trimmed)
    
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        valid: false,
        error: 'Headers must be a JSON object',
      }
    }
    
    return {
      valid: true,
      headers: parsed as Record<string, string>,
    }
  } catch (parseError) {
    return {
      valid: false,
      error: 'Custom headers must be valid JSON object',
    }
  }
}

/**
 * Normalizes headers draft input (legacy function for compatibility)
 * @param input - Raw JSON string input
 * @returns Parsed headers object
 * @throws Error if validation fails
 */
export function normalizeHeadersDraft(input: string): Record<string, string> {
  const result = validateHeaders(input)
  
  if (!result.valid) {
    throw new Error(result.error)
  }
  
  return result.headers || {}
}

/**
 * Validates that a URL string is properly formatted
 * @param url - URL string to validate
 * @returns true if valid, false otherwise
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }
  
  try {
    new URL(url.trim())
    return true
  } catch {
    return false
  }
}

/**
 * Validates that an API key is not empty and meets basic requirements
 * @param apiKey - API key string to validate
 * @returns true if valid, false otherwise
 */
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false
  }
  
  const trimmed = apiKey.trim()
  return trimmed.length >= 8
}
