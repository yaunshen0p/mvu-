import { describe, it, expect } from 'vitest';
import { translateErrorMessage } from '../errors';

describe('errors', () => {
  describe('translateErrorMessage', () => {
    it('should return empty string for null or undefined', () => {
      expect(translateErrorMessage(undefined)).toBe('');
      expect(translateErrorMessage('')).toBe('');
    });

    it('should translate network errors', () => {
      expect(translateErrorMessage('Failed to fetch')).toBe('网络请求失败，请检查连接。');
      expect(translateErrorMessage('NetworkError')).toBe('网络请求失败，请检查连接。');
    });

    it('should translate timeout errors', () => {
      expect(translateErrorMessage('Request timeout')).toBe('请求超时，请稍后重试。');
      expect(translateErrorMessage('timeout exceeded')).toBe('请求超时，请稍后重试。');
    });

    it('should translate authentication errors', () => {
      expect(translateErrorMessage('Unauthorized')).toBe('认证失败，请检查 API 凭据。');
      expect(translateErrorMessage('401')).toBe('认证失败，请检查 API 凭据。');
      expect(translateErrorMessage('Forbidden')).toBe('权限不足，请检查 API 凭据。');
      expect(translateErrorMessage('403')).toBe('权限不足，请检查 API 凭据。');
    });

    it('should translate not found errors', () => {
      expect(translateErrorMessage('Not found')).toBe('未找到目标接口，请检查基础 URL。');
      expect(translateErrorMessage('404')).toBe('未找到目标接口，请检查基础 URL。');
    });

    it('should translate server errors', () => {
      expect(translateErrorMessage('Bad gateway')).toBe('服务暂时不可用，请稍后重试。');
      expect(translateErrorMessage('Service unavailable')).toBe('服务暂时不可用，请稍后重试。');
      expect(translateErrorMessage('502')).toBe('服务暂时不可用，请稍后重试。');
      expect(translateErrorMessage('503')).toBe('服务暂时不可用，请稍后重试。');
      expect(translateErrorMessage('504')).toBe('服务暂时不可用，请稍后重试。');
    });

    it('should translate JSON parse errors', () => {
      expect(translateErrorMessage('Invalid JSON response body')).toBe('服务器响应格式错误，请稍后重试。');
      expect(translateErrorMessage('Unexpected token in JSON')).toBe('服务器响应格式错误，请稍后重试。');
    });

    it('should translate abort errors', () => {
      expect(translateErrorMessage('Request aborted')).toBe('请求已取消。');
      expect(translateErrorMessage('abort')).toBe('请求已取消。');
    });

    it('should translate rate limit errors', () => {
      expect(translateErrorMessage('Rate limit exceeded')).toBe('请求过于频繁，请稍后重试。');
      expect(translateErrorMessage('Too many requests')).toBe('请求过于频繁，请稍后重试。');
      expect(translateErrorMessage('429')).toBe('请求过于频繁，请稍后重试。');
    });

    it('should translate API key errors', () => {
      expect(translateErrorMessage('Invalid API key')).toBe('API 密钥无效或未配置。');
      expect(translateErrorMessage('apikey required')).toBe('API 密钥无效或未配置。');
    });

    it('should translate model errors', () => {
      expect(translateErrorMessage('Invalid model')).toBe('指定的模型不存在或无访问权限。');
      expect(translateErrorMessage('Model not found')).toBe('指定的模型不存在或无访问权限。');
    });

    it('should return original message for unknown errors', () => {
      const customError = 'Custom error message';
      expect(translateErrorMessage(customError)).toBe(customError);
    });

    it('should be case-insensitive', () => {
      expect(translateErrorMessage('UNAUTHORIZED')).toBe('认证失败，请检查 API 凭据。');
      expect(translateErrorMessage('Failed To Fetch')).toBe('网络请求失败，请检查连接。');
    });
  });
});
