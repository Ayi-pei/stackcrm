import { RateLimiterMemory } from 'rate-limiter-flexible';

// 创建速率限制器
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 请求次数
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900, // 时间窗口（秒）
});

// 速率限制中间件
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

export { rateLimiter };