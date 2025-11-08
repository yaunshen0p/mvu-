/**
 * Error message translation utilities for localized error handling.
 */

export function translateErrorMessage(message: string | undefined): string {
  if (!message) return '';
  const trimmed = `${message}`.trim();
  if (!trimmed) return '';

  const normalized = trimmed.toLowerCase();

  if (normalized.includes('failed to fetch') || normalized.includes('networkerror')) {
    return '网络请求失败，请检查连接。';
  }

  if (normalized.includes('timeout')) {
    return '请求超时，请稍后重试。';
  }

  if (normalized.includes('unauthorized') || normalized.includes('401')) {
    return '认证失败，请检查 API 凭据。';
  }

  if (normalized.includes('forbidden') || normalized.includes('403')) {
    return '权限不足，请检查 API 凭据。';
  }

  if (normalized.includes('not found') || normalized.includes('404')) {
    return '未找到目标接口，请检查基础 URL。';
  }

  if (
    normalized.includes('bad gateway') ||
    normalized.includes('service unavailable') ||
    normalized.includes('gateway timeout') ||
    normalized.includes('502') ||
    normalized.includes('503') ||
    normalized.includes('504')
  ) {
    return '服务暂时不可用，请稍后重试。';
  }

  if (
    normalized.includes('invalid json response body') ||
    normalized.includes('unexpected token') ||
    normalized.includes('json.parse')
  ) {
    return '服务器响应格式错误，请稍后重试。';
  }

  if (normalized.includes('aborted') || normalized.includes('abort')) {
    return '请求已取消。';
  }

  if (normalized.includes('rate limit') || normalized.includes('too many requests') || normalized.includes('429')) {
    return '请求过于频繁，请稍后重试。';
  }

  if (normalized.includes('api key') || normalized.includes('apikey')) {
    return 'API 密钥无效或未配置。';
  }

  if (normalized.includes('invalid model') || normalized.includes('model not found')) {
    return '指定的模型不存在或无访问权限。';
  }

  return trimmed;
}
