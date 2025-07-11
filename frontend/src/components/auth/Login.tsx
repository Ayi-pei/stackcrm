import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { Key, Shield, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

// 当前登录页
export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [loginType, setLoginType] = useState<'unknown' | 'admin' | 'agent'>('unknown');
  const { login, loading: authLoading, error: authError } = useAuthStore();
  const navigate = useNavigate();

  // 检测输入类型并自动登录管理员
  const detectInputType = async (value: string) => {
    if (value === 'adminayi888') {
      setLoginType('admin');
      // 自动登录管理员
      setLoading(true);
      try {
        await login(value);
        message.success('管理员登录成功');
        navigate('/admin/dashboard');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '登录失败';
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    } else if (value.match(/^[a-z0-9]{12,16}$/)) {
      setLoginType('agent');
    } else {
      setLoginType('unknown');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    detectInputType(value);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      message.error('请输入坐席密钥');
      return;
    }

    // 管理员已在输入时自动登录，这里只处理坐席登录
    if (inputValue === 'adminayi888') {
      return; // 管理员已经处理过了
    }

    setLoading(true);
    
    try {
      await login(inputValue);
      message.success('坐席登录成功');
      navigate('/agent-chat');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getInputIcon = () => {
    switch (loginType) {
      case 'admin':
        return <Shield size={20} className="text-red-500" />;
      case 'agent':
        return <Key size={20} className="text-blue-500" />;
      default:
        return <User size={20} className="text-gray-400" />;
    }
  };

  const getInputPlaceholder = () => {
    switch (loginType) {
      case 'admin':
        return '管理员密钥已识别';
      case 'agent':
        return '坐席密钥已识别';
      default:
        return '请输入管理员密钥或坐席密钥';
    }
  };

  const getCardTitle = () => {
    switch (loginType) {
      case 'admin':
        return '管理员登录';
      case 'agent':
        return '坐席登录';
      default:
        return '云聚CRM';
    }
  };

  const getCardDescription = () => {
    switch (loginType) {
      case 'admin':
        return '管理员控制台';
      case 'agent':
        return '客服工作台';
      default:
        return '智能客服管理系统';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <div className={`mx-auto h-16 w-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 ${
            loginType === 'admin' 
              ? 'bg-gradient-to-r from-red-600 to-orange-600' 
              : loginType === 'agent'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
              : 'bg-gradient-to-r from-gray-600 to-gray-700'
          }`}>
            {loginType === 'admin' ? (
              <Shield className="h-8 w-8 text-white" />
            ) : loginType === 'agent' ? (
              <Key className="h-8 w-8 text-white" />
            ) : (
              <User className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{getCardTitle()}</h1>
          <p className="text-gray-600">{getCardDescription()}</p>
        </div>

        {/* 登录类型提示 */}
        {loginType !== 'unknown' && (
          <Alert
            message={
              loginType === 'admin' 
                ? '检测到管理员密钥，正在自动登录到管理控制台...' 
                : '检测到坐席密钥，点击登录按钮进入客服工作台'
            }
            type={loginType === 'admin' ? 'success' : 'info'}
            showIcon
            className="mb-4"
          />
        )}

        <Form onFinish={handleSubmit} layout="vertical" size="large">
          <Form.Item
            name="accessKey"
            rules={[{ required: true, message: '请输入密钥' }]}
          >
            <Input
              prefix={getInputIcon()}
              placeholder={getInputPlaceholder()}
              value={inputValue}
              onChange={handleInputChange}
              className={`transition-all duration-300 ${
                loginType === 'admin' 
                  ? 'border-red-300 focus:border-red-500' 
                  : loginType === 'agent'
                  ? 'border-blue-300 focus:border-blue-500'
                  : ''
              }`}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading || authLoading}
              className={`w-full transition-all duration-300 ${
                loginType === 'admin' 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 border-0' 
                  : loginType === 'agent'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-0 hover:from-blue-700 hover:to-indigo-700'
                  : ''
              }`}
              size="large"
              disabled={!inputValue.trim() || loginType === 'admin'}
            >
              {loginType === 'admin' 
                ? '管理员自动登录中...' 
                : (loading || authLoading) 
                ? '验证中...' 
                : loginType === 'agent' 
                ? '坐席登录' 
                : '登录'}
            </Button>
          </Form.Item>
        </Form>
        
        {authError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{authError}</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500 space-y-2">
          <div className="border-t pt-4">
            <p className="font-medium text-gray-700 mb-2">登录说明：</p>
            <div className="space-y-1 text-xs">
              <p className="flex items-center justify-center space-x-2">
                <Shield size={14} className="text-red-500" />
                <span>管理员: adminayi888</span>
              </p>
              <p className="flex items-center justify-center space-x-2">
                <Key size={14} className="text-blue-500" />
                <span>坐席: naoiod格式密钥 (12-16位字母数字)</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            用户无需登录，通过客服分享的链接直接进入聊天
          </p>
        </div>
      </Card>
    </div>
  );
};