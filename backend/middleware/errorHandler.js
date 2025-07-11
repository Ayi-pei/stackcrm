// 全局错误处理中间件
export const errorHandler = (err, req, res, next) => {
  console.error('服务器错误:', err);

  // 默认错误信息
  let error = {
    message: err.message || '服务器内部错误',
    status: err.status || 500
  };

  // 根据错误类型设置具体信息
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = '数据验证失败';
    error.details = err.details;
  } else if (err.name === 'UnauthorizedError') {
    error.status = 401;
    error.message = '未授权访问';
  } else if (err.code === '23505') { // PostgreSQL unique violation
    error.status = 409;
    error.message = '数据已存在';
  } else if (err.code === '23503') { // PostgreSQL foreign key violation
    error.status = 400;
    error.message = '关联数据不存在';
  }

  // 开发环境返回详细错误信息
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(error.status).json({
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.details 
    })
  });
};

// 异步错误包装器
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};