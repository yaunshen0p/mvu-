import { describe, it, expect } from 'vitest'
import { validateHeaders, normalizeHeadersDraft, validateUrl, validateApiKey } from '../validation'

describe('validateHeaders', () => {
  it('should return empty object for empty input', () => {
    const result = validateHeaders('')
    expect(result.valid).toBe(true)
    expect(result.headers).toEqual({})
  })

  it('should return empty object for whitespace-only input', () => {
    const result = validateHeaders('   \n  ')
    expect(result.valid).toBe(true)
    expect(result.headers).toEqual({})
  })

  it('should parse valid JSON object', () => {
    const input = '{"Authorization": "Bearer token", "X-Custom": "value"}'
    const result = validateHeaders(input)
    expect(result.valid).toBe(true)
    expect(result.headers).toEqual({
      Authorization: 'Bearer token',
      'X-Custom': 'value',
    })
  })

  it('should parse valid JSON with whitespace', () => {
    const input = `
      {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    `
    const result = validateHeaders(input)
    expect(result.valid).toBe(true)
    expect(result.headers).toEqual({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    })
  })

  it('should reject invalid JSON', () => {
    const result = validateHeaders('{invalid json}')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Custom headers must be valid JSON object')
  })

  it('should reject JSON arrays', () => {
    const result = validateHeaders('["header1", "header2"]')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Headers must be a JSON object')
  })

  it('should reject JSON strings', () => {
    const result = validateHeaders('"just a string"')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Headers must be a JSON object')
  })

  it('should reject JSON numbers', () => {
    const result = validateHeaders('123')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Headers must be a JSON object')
  })

  it('should reject JSON null', () => {
    const result = validateHeaders('null')
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Headers must be a JSON object')
  })

  it('should handle nested objects', () => {
    const input = '{"Authorization": "Bearer token"}'
    const result = validateHeaders(input)
    expect(result.valid).toBe(true)
    expect(result.headers).toEqual({
      Authorization: 'Bearer token',
    })
  })
})

describe('normalizeHeadersDraft', () => {
  it('should return empty object for empty input', () => {
    const headers = normalizeHeadersDraft('')
    expect(headers).toEqual({})
  })

  it('should parse valid JSON object', () => {
    const input = '{"X-API-Key": "secret"}'
    const headers = normalizeHeadersDraft(input)
    expect(headers).toEqual({ 'X-API-Key': 'secret' })
  })

  it('should throw error for invalid JSON', () => {
    expect(() => normalizeHeadersDraft('{invalid')).toThrow('Custom headers must be valid JSON object')
  })

  it('should throw error for JSON arrays', () => {
    expect(() => normalizeHeadersDraft('[]')).toThrow('Headers must be a JSON object')
  })
})

describe('validateUrl', () => {
  it('should validate valid HTTP URLs', () => {
    expect(validateUrl('http://api.example.com')).toBe(true)
    expect(validateUrl('https://api.example.com')).toBe(true)
  })

  it('should validate URLs with paths', () => {
    expect(validateUrl('https://api.openai.com/v1')).toBe(true)
    expect(validateUrl('https://example.com/api/v2/endpoint')).toBe(true)
  })

  it('should validate URLs with query parameters', () => {
    expect(validateUrl('https://example.com?key=value')).toBe(true)
  })

  it('should trim whitespace before validation', () => {
    expect(validateUrl('  https://api.example.com  ')).toBe(true)
  })

  it('should reject invalid URLs', () => {
    expect(validateUrl('not-a-url')).toBe(false)
    expect(validateUrl('htp://wrong-protocol.com')).toBe(false)
    expect(validateUrl('')).toBe(false)
  })

  it('should reject non-string inputs', () => {
    expect(validateUrl(null as any)).toBe(false)
    expect(validateUrl(undefined as any)).toBe(false)
    expect(validateUrl(123 as any)).toBe(false)
  })

  it('should validate localhost URLs', () => {
    expect(validateUrl('http://localhost:3000')).toBe(true)
    expect(validateUrl('http://127.0.0.1:8080')).toBe(true)
  })
})

describe('validateApiKey', () => {
  it('should accept valid API keys', () => {
    expect(validateApiKey('sk-1234567890abcdef')).toBe(true)
    expect(validateApiKey('my-secret-api-key-12345')).toBe(true)
  })

  it('should accept minimum length API keys', () => {
    expect(validateApiKey('12345678')).toBe(true)
  })

  it('should reject short API keys', () => {
    expect(validateApiKey('short')).toBe(false)
    expect(validateApiKey('1234567')).toBe(false)
  })

  it('should reject empty strings', () => {
    expect(validateApiKey('')).toBe(false)
    expect(validateApiKey('   ')).toBe(false)
  })

  it('should reject non-string inputs', () => {
    expect(validateApiKey(null as any)).toBe(false)
    expect(validateApiKey(undefined as any)).toBe(false)
    expect(validateApiKey(123 as any)).toBe(false)
  })

  it('should trim whitespace', () => {
    expect(validateApiKey('  valid-key-123  ')).toBe(true)
  })
})
