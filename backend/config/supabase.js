// config/supabase.js
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// 加载环境变量
dotenv.config();

// Supabase 配置
const supabaseUrl = 'https://poxaenrqnynfjbctgdyb.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBveGFlbnJxbnluZmpiY3RnZHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzgyNDMsImV4cCI6MjA2NzUxNDI0M30.iBXKXjZpiTc-89kBck_Ukqdjl1H25QYDVH8Dr6F9F_o';

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseKey);

// 保持原有的默认导出
export default supabase;