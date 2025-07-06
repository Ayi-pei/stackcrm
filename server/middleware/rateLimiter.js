// middleware/rateLimiter.js
import { RateLimiterMemory } from 'rate-limiter-flexible';

// 实例化限流器
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: (parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000, // 转换为秒
});

// 具名导出中间件函数
export const rateLimiterMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: '请求过于频繁，请稍后再试',
      retryAfter: secs
    });
  }
};

// 可选：单独导出限流器实例
export { rateLimiter };