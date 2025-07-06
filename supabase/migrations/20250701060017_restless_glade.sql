-- 云聚CRM数据库架构
-- 创建时间: 2024年12月
-- 版本: 1.0.0

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. 角色表 (roles)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- 十六进制颜色
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 100), -- 权限级别 1-100
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 权限表 (permissions)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 角色权限关联表 (role_permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. 用户表 (users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    role_id UUID REFERENCES roles(id),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'break', 'offline', 'training')),
    access_key VARCHAR(16) UNIQUE, -- naoiod格式密钥
    key_expires_at TIMESTAMP WITH TIME ZONE,
    is_online BOOLEAN DEFAULT false,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 密钥管理表 (access_keys)
CREATE TABLE IF NOT EXISTS access_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_value VARCHAR(16) UNIQUE NOT NULL, -- naoiod格式密钥
    key_type VARCHAR(20) NOT NULL CHECK (key_type IN ('agent', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
    user_id UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    max_usage INTEGER, -- 最大使用次数
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 密钥使用日志表 (key_usage_logs)
CREATE TABLE IF NOT EXISTS key_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id UUID REFERENCES access_keys(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'login', 'logout', 'session_start', 'session_end', 'heartbeat'
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    duration INTEGER, -- 持续时间（秒）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. 客户表 (customers)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    ip_address INET,
    device_info TEXT,
    user_agent TEXT,
    location VARCHAR(255),
    is_online BOOLEAN DEFAULT false,
    is_blacklisted BOOLEAN DEFAULT false,
    has_received_welcome BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. 聊天会话表 (chat_sessions)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    agent_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'vip')),
    source VARCHAR(50) DEFAULT 'web', -- 'web', 'mobile', 'api'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5), -- 1-5星评分
    welcome_sent BOOLEAN DEFAULT false,
    tags TEXT[], -- 会话标签
    metadata JSONB, -- 额外元数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. 聊天消息表 (chat_messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id),
    sender_id UUID, -- 可以是customer_id或user_id
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT NOT NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
    is_welcome_message BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. 坐席设置表 (agent_settings)
CREATE TABLE IF NOT EXISTS agent_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID UNIQUE REFERENCES users(id),
    auto_welcome_enabled BOOLEAN DEFAULT true,
    sound_notifications BOOLEAN DEFAULT true,
    auto_reply_enabled BOOLEAN DEFAULT false,
    max_concurrent_sessions INTEGER DEFAULT 5,
    working_hours JSONB, -- 工作时间配置
    break_duration INTEGER DEFAULT 15, -- 休息时长（分钟）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. 快捷回复表 (quick_replies)
CREATE TABLE IF NOT EXISTS quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50),
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. 欢迎语表 (welcome_messages)
CREATE TABLE IF NOT EXISTS welcome_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. 文件上传表 (file_uploads)
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES users(id),
    session_id UUID REFERENCES chat_sessions(id),
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploading', 'uploaded', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. 系统配置表 (system_settings)
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT false, -- 是否可以被前端访问
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. 短链接表 (short_links)
CREATE TABLE IF NOT EXISTS short_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    short_id VARCHAR(10) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    agent_id UUID REFERENCES users(id),
    click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_access_key ON users(access_key);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_access_keys_key_value ON access_keys(key_value);
CREATE INDEX IF NOT EXISTS idx_access_keys_user_id ON access_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_access_keys_status ON access_keys(status);
CREATE INDEX IF NOT EXISTS idx_access_keys_expires_at ON access_keys(expires_at);

CREATE INDEX IF NOT EXISTS idx_key_usage_logs_key_id ON key_usage_logs(key_id);
CREATE INDEX IF NOT EXISTS idx_key_usage_logs_user_id ON key_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_key_usage_logs_created_at ON key_usage_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_is_online ON customers(is_online);
CREATE INDEX IF NOT EXISTS idx_customers_is_blacklisted ON customers(is_blacklisted);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_customer_id ON chat_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_id ON chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX IF NOT EXISTS idx_quick_replies_agent_id ON quick_replies(agent_id);
CREATE INDEX IF NOT EXISTS idx_quick_replies_category ON quick_replies(category);

CREATE INDEX IF NOT EXISTS idx_welcome_messages_agent_id ON welcome_messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_welcome_messages_order ON welcome_messages(display_order);

CREATE INDEX IF NOT EXISTS idx_file_uploads_session_id ON file_uploads(session_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_short_links_short_id ON short_links(short_id);
CREATE INDEX IF NOT EXISTS idx_short_links_agent_id ON short_links(agent_id);

-- 创建更新时间触发器
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_keys_updated_at BEFORE UPDATE ON access_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_settings_updated_at BEFORE UPDATE ON agent_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_replies_updated_at BEFORE UPDATE ON quick_replies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_welcome_messages_updated_at BEFORE UPDATE ON welcome_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_short_links_updated_at BEFORE UPDATE ON short_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 初始化角色数据
INSERT INTO roles (name, display_name, color, level, description) VALUES
('super_admin', '超级管理员', '#ff4d4f', 100, '系统最高权限'),
('admin', '管理员', '#fa8c16', 90, '管理员权限'),
('supervisor', '主管', '#1890ff', 70, '团队主管权限'),
('senior_agent', '高级客服', '#52c41a', 50, '高级客服权限'),
('agent', '普通客服', '#722ed1', 30, '普通客服权限'),
('trainee', '实习客服', '#13c2c2', 10, '实习客服权限')
ON CONFLICT (name) DO NOTHING;

-- 初始化权限数据
INSERT INTO permissions (name, display_name, category, description) VALUES
-- 聊天相关权限
('chat.send', '发送消息', 'chat', '发送聊天消息'),
('chat.receive', '接收消息', 'chat', '接收聊天消息'),
('chat.transfer', '转接会话', 'chat', '将会话转接给其他客服'),
('chat.end', '结束会话', 'chat', '结束当前会话'),
('chat.history', '查看历史', 'chat', '查看聊天历史记录'),

-- 数据相关权限
('data.view.own', '查看个人数据', 'data', '查看自己的数据'),
('data.view.team', '查看团队数据', 'data', '查看团队数据'),
('data.view.all', '查看全部数据', 'data', '查看所有数据'),
('data.export', '导出数据', 'data', '导出数据报表'),

-- 管理相关权限
('agent.create', '创建坐席', 'management', '创建新的坐席账号'),
('agent.edit', '编辑坐席', 'management', '编辑坐席信息'),
('agent.delete', '删除坐席', 'management', '删除坐席账号'),
('agent.assign', '分配坐席', 'management', '分配坐席到组织'),

-- 系统相关权限
('system.config', '系统配置', 'system', '修改系统配置'),
('system.monitor', '系统监控', 'system', '查看系统监控数据'),
('system.logs', '系统日志', 'system', '查看系统操作日志'),

-- 质检相关权限
('quality.check', '质量检查', 'quality', '进行服务质量检查'),
('quality.report', '质检报告', 'quality', '生成质检报告'),

-- 培训相关权限
('training.conduct', '培训指导', 'training', '进行培训指导'),
('training.receive', '接受培训', 'training', '接受培训指导')
ON CONFLICT (name) DO NOTHING;

-- 初始化系统配置
INSERT INTO system_settings (key, value, description, category) VALUES
('key_default_validity_hours', '48', '密钥默认有效期（小时）', 'security'),
('max_sessions_per_agent', '5', '每个坐席最大并发会话数', 'performance'),
('auto_assignment_enabled', 'true', '是否启用自动分配', 'assignment'),
('welcome_message_delay', '1000', '欢迎语发送间隔（毫秒）', 'chat')
ON CONFLICT (key) DO NOTHING;

-- 创建默认管理员账号
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- 获取超级管理员角色ID
    SELECT id INTO admin_role_id FROM roles WHERE name = 'super_admin';
    
    -- 创建管理员用户
    INSERT INTO users (name, email, role_id, access_key, key_expires_at, status) 
    VALUES (
        '系统管理员', 
        'admin@system.com', 
        admin_role_id, 
        'adminayi888', 
        CURRENT_TIMESTAMP + INTERVAL '10 years',
        'online'
    )
    ON CONFLICT (access_key) DO NOTHING;
END $$;