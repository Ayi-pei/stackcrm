// config/supabase.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 加载环境变量
dotenv.config();

// 创建 Supabase 客户端实例
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
);

// 保持原有的默认导出
export default supabase;