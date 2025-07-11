import crypto from 'crypto';

/**
 * 生成naoiod格式密钥
 * @param {string} type - 密钥类型 ('agent' | 'admin')
 * @returns {string} 生成的密钥
 */
export function generateNaoiodKey(type = 'agent') {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = type === 'admin' ? 12 : 16; // 管理员密钥12位，坐席密钥16位
  let result = '';
  
  // 使用加密安全的随机数生成器
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  
  return result;
}

/**
 * 验证naoiod格式密钥
 * @param {string} key - 要验证的密钥
 * @returns {boolean} 是否为有效格式
 */
export function validateNaoiodFormat(key) {
  if (!key || typeof key !== 'string') {
    return false;
  }
  
  // naoiod格式：纯小写字母和数字组合，长度12-16位
  const pattern = /^[a-z0-9]{12,16}$/;
  return pattern.test(key);
}

/**
 * 生成短链接ID
 * @returns {string} 短链接ID
 */
export function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  const randomBytes = crypto.randomBytes(6);
  
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  
  return result;
}

/**
 * 验证密钥强度
 * @param {string} key - 密钥
 * @returns {object} 验证结果
 */
export function validateKeyStrength(key) {
  const result = {
    isValid: false,
    score: 0,
    issues: []
  };

  if (!key) {
    result.issues.push('密钥不能为空');
    return result;
  }

  if (key.length < 12) {
    result.issues.push('密钥长度至少12位');
  } else if (key.length >= 12 && key.length <= 16) {
    result.score += 25;
  }

  if (!/^[a-z0-9]+$/.test(key)) {
    result.issues.push('密钥只能包含小写字母和数字');
  } else {
    result.score += 25;
  }

  // 检查字符多样性
  const hasLetters = /[a-z]/.test(key);
  const hasNumbers = /[0-9]/.test(key);
  
  if (hasLetters && hasNumbers) {
    result.score += 25;
  } else {
    result.issues.push('密钥应包含字母和数字');
  }

  // 检查重复字符
  const uniqueChars = new Set(key).size;
  if (uniqueChars / key.length > 0.6) {
    result.score += 25;
  } else {
    result.issues.push('密钥重复字符过多');
  }

  result.isValid = result.score >= 75 && result.issues.length === 0;
  
  return result;
}