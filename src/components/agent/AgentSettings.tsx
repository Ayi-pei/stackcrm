import React, { useState, useEffect } from 'react';
import { Card, Tabs, Input, Switch, Button, Form, message, List, Modal, Tag, QRCode, Tooltip, Space, Avatar, Upload, Alert, Select, InputNumber } from 'antd';
import { Plus, Edit, Trash2, Save, ArrowLeft, Copy, QrCode, Link, RefreshCw, ArrowUp, ArrowDown, User, Camera, Key, AlertTriangle, CheckCircle, Clock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';
import { useAdminStore } from '../../stores/adminStore';
import { QuickReply, WelcomeMessage } from '../../types/chat';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

export const AgentSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const { validateKey } = useAdminStore();
  const { 
    agentSettings, 
    setAgentSettings, 
    updateQuickReplies, 
    updateWelcomeMessages,
    toggleAutoWelcome,
    addToBlacklist,
    removeFromBlacklist
  } = useChatStore();
  
  const [form] = Form.useForm();
  const [quickReplyForm] = Form.useForm();
  const [welcomeMessageForm] = Form.useForm();
  const [keyForm] = Form.useForm();
  const [profileForm] = Form.useForm();
  
  const [isQuickReplyModalVisible, setIsQuickReplyModalVisible] = useState(false);
  const [isWelcomeMessageModalVisible, setIsWelcomeMessageModalVisible] = useState(false);
  const [isKeyModalVisible, setIsKeyModalVisible] = useState(false);
  const [editingQuickReply, setEditingQuickReply] = useState<QuickReply | null>(null);
  const [editingWelcomeMessage, setEditingWelcomeMessage] = useState<WelcomeMessage | null>(null);
  const [agentLink, setAgentLink] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [keyValidating, setKeyValidating] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // 模拟当前密钥信息 - 使用naoiod格式，默认48小时有效期
  const [currentKey, setCurrentKey] = useState({
    key: user?.accessKey || 'naoiodabcdef123456',
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 修改为2天（48小时）后过期
    status: 'active' as 'active' | 'expired' | 'expiring_soon'
  });

  // 初始化数据
  useEffect(() => {
    if (user && !agentSettings) {
      const mockAgentSettings = {
        id: 'settings-1',
        agentId: user.id,
        welcomeMessage: '您好！欢迎咨询，我是您的专属客服，有什么可以帮助您的吗？',
        autoReply: true,
        soundNotifications: true,
        autoWelcomeEnabled: true,
        welcomeMessages: [
          {
            id: 'welcome-1',
            content: '您好！欢迎咨询，我是您的专属客服。',
            isEnabled: true,
            order: 1
          },
          {
            id: 'welcome-2',
            content: '我是专业的客服顾问，有什么可以帮助您的吗？',
            isEnabled: true,
            order: 2
          }
        ],
        quickReplies: [
          {
            id: 'qr-1',
            title: '问候语',
            content: '您好！很高兴为您服务，请问有什么可以帮助您的吗？',
            category: '常用',
            agentId: user.id
          },
          {
            id: 'qr-2',
            title: '稍等回复',
            content: '好的，请稍等，我马上为您查询处理。',
            category: '常用',
            agentId: user.id
          }
        ],
        blacklistedUsers: []
      };
      setAgentSettings(mockAgentSettings);
    }

    // 生成客服链接
    if (user) {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/chat/${user.id}`;
      setAgentLink(link);
      
      // 生成短链
      const shortId = Math.random().toString(36).substring(2, 8);
      setShortLink(`${baseUrl}/s/${shortId}`);
    }

    // 设置表单初始值
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        avatar: user.avatar
      });
    }
  }, [user, agentSettings, setAgentSettings, profileForm]);

  // 计算密钥剩余天数
  const getDaysRemaining = () => {
    const now = new Date();
    const expires = new Date(currentKey.expiresAt);
    const diffTime = expires.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 获取密钥状态
  const getKeyStatus = () => {
    const daysRemaining = getDaysRemaining();
    if (daysRemaining <= 0) return 'expired';
    if (daysRemaining <= 1) return 'expiring_soon'; // 修改为1天内即将过期
    return 'active';
  };

  // 更新密钥状态
  useEffect(() => {
    const status = getKeyStatus();
    setCurrentKey(prev => ({ ...prev, status }));
  }, []);

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${type}已复制到剪贴板`);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      message.success(`${type}已复制到剪贴板`);
    }
  };

  // 重新生成短链
  const regenerateShortLink = () => {
    const shortId = Math.random().toString(36).substring(2, 8);
    const newShortLink = `${window.location.origin}/s/${shortId}`;
    setShortLink(newShortLink);
    message.success('短链已重新生成');
  };

  // 验证新密钥
  const validateNewKey = async (newKey: string): Promise<boolean> => {
    setKeyValidating(true);
    
    try {
      const isValid = await validateKey(newKey);
      setKeyValidating(false);
      return isValid && newKey !== currentKey.key;
    } catch (error) {
      setKeyValidating(false);
      return false;
    }
  };

  // 处理密钥更换
  const handleKeyChange = async (values: { newKey: string }) => {
    const { newKey } = values;
    
    try {
      const isValid = await validateNewKey(newKey);
      
      if (!isValid) {
        message.error('密钥格式无效或与当前密钥相同，请检查后重试');
        return;
      }

      // 更新密钥信息 - 新密钥默认48小时有效期
      setCurrentKey({
        key: newKey,
        expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 修改为2天（48小时）有效期
        status: 'active'
      });

      // 更新用户信息中的密钥
      updateUser({ accessKey: newKey });

      setIsKeyModalVisible(false);
      keyForm.resetFields();
      message.success('密钥更换成功！新密钥有效期为48小时');
      
    } catch (error) {
      message.error('密钥验证失败，请稍后重试');
    }
  };

  // 处理头像上传
  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      const avatarUrl = URL.createObjectURL(info.file.originFileObj);
      updateUser({ avatar: avatarUrl });
      message.success('头像上传成功');
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  // 处理基本信息保存
  const handleProfileSave = async (values: any) => {
    setProfileSaving(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateUser({
        name: values.name
      });
      
      message.success('基本信息已保存');
    } catch (error) {
      message.error('保存失败，请重试');
    } finally {
      setProfileSaving(false);
    }
  };

  // 快捷回复相关函数
  const handleQuickReplySave = async (values: any) => {
    if (!agentSettings || !user) return;

    const quickReply: QuickReply = {
      id: editingQuickReply?.id || Date.now().toString(),
      ...values,
      agentId: user.id
    };

    let updatedQuickReplies;
    if (editingQuickReply) {
      updatedQuickReplies = agentSettings.quickReplies.map(qr =>
        qr.id === editingQuickReply.id ? quickReply : qr
      );
    } else {
      updatedQuickReplies = [...agentSettings.quickReplies, quickReply];
    }

    updateQuickReplies(updatedQuickReplies);
    setIsQuickReplyModalVisible(false);
    setEditingQuickReply(null);
    quickReplyForm.resetFields();
    message.success(editingQuickReply ? '快捷回复已更新' : '快捷回复已添加');
  };

  const handleQuickReplyDelete = (id: string) => {
    if (!agentSettings) return;

    const updatedQuickReplies = agentSettings.quickReplies.filter(qr => qr.id !== id);
    updateQuickReplies(updatedQuickReplies);
    message.success('快捷回复已删除');
  };

  const handleQuickReplyEdit = (quickReply: QuickReply) => {
    setEditingQuickReply(quickReply);
    quickReplyForm.setFieldsValue(quickReply);
    setIsQuickReplyModalVisible(true);
  };

  // 欢迎语相关函数
  const handleWelcomeMessageSave = async (values: any) => {
    if (!agentSettings || !user) return;

    const welcomeMessage: WelcomeMessage = {
      id: editingWelcomeMessage?.id || Date.now().toString(),
      ...values,
      order: editingWelcomeMessage?.order || (agentSettings.welcomeMessages.length + 1)
    };

    let updatedWelcomeMessages;
    if (editingWelcomeMessage) {
      updatedWelcomeMessages = agentSettings.welcomeMessages.map(wm =>
        wm.id === editingWelcomeMessage.id ? welcomeMessage : wm
      );
    } else {
      updatedWelcomeMessages = [...agentSettings.welcomeMessages, welcomeMessage];
    }

    updateWelcomeMessages(updatedWelcomeMessages);
    setIsWelcomeMessageModalVisible(false);
    setEditingWelcomeMessage(null);
    welcomeMessageForm.resetFields();
    message.success(editingWelcomeMessage ? '欢迎语已更新' : '欢迎语已添加');
  };

  const handleWelcomeMessageDelete = (id: string) => {
    if (!agentSettings) return;

    const updatedWelcomeMessages = agentSettings.welcomeMessages.filter(wm => wm.id !== id);
    updateWelcomeMessages(updatedWelcomeMessages);
    message.success('欢迎语已删除');
  };

  const handleWelcomeMessageEdit = (welcomeMessage: WelcomeMessage) => {
    setEditingWelcomeMessage(welcomeMessage);
    welcomeMessageForm.setFieldsValue(welcomeMessage);
    setIsWelcomeMessageModalVisible(true);
  };

  const handleWelcomeMessageOrderChange = (id: string, direction: 'up' | 'down') => {
    if (!agentSettings) return;

    const messages = [...agentSettings.welcomeMessages];
    const index = messages.findIndex(wm => wm.id === id);
    
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= messages.length) return;
    
    [messages[index], messages[newIndex]] = [messages[newIndex], messages[index]];
    
    messages.forEach((msg, idx) => {
      msg.order = idx + 1;
    });
    
    updateWelcomeMessages(messages);
    message.success('顺序已调整');
  };

  const handleWelcomeMessageToggle = (id: string, enabled: boolean) => {
    if (!agentSettings) return;

    const updatedWelcomeMessages = agentSettings.welcomeMessages.map(wm =>
      wm.id === id ? { ...wm, isEnabled: enabled } : wm
    );

    updateWelcomeMessages(updatedWelcomeMessages);
    message.success(enabled ? '欢迎语已启用' : '欢迎语已停用');
  };

  const handleAutoWelcomeToggle = (enabled: boolean) => {
    toggleAutoWelcome(enabled);
    message.success(enabled ? '自动欢迎语已启用' : '自动欢迎语已停用');
  };

  if (!agentSettings) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>加载设置中...</p>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining();
  const keyStatus = getKeyStatus();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/agent-chat')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">客服设置</h1>
        </div>
      </div>

      <div className="max-w-4xl">
        <Tabs defaultActiveKey="basic" type="card">
          <TabPane tab="基本信息" key="basic">
            <Card>
              <div className="space-y-6">
                {/* 客服头像和昵称 */}
                <div className="flex items-start space-x-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <Avatar
                        size={80}
                        src={user?.avatar}
                        icon={<User />}
                        className="border-2 border-gray-200"
                      />
                      <Upload
                        name="avatar"
                        showUploadList={false}
                        action="/api/upload/avatar"
                        beforeUpload={(file) => {
                          const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                          if (!isJpgOrPng) {
                            message.error('只能上传 JPG/PNG 格式的图片!');
                          }
                          const isLt2M = file.size / 1024 / 1024 < 2;
                          if (!isLt2M) {
                            message.error('图片大小不能超过 2MB!');
                          }
                          return isJpgOrPng && isLt2M;
                        }}
                        onChange={handleAvatarChange}
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<Camera size={14} />}
                          className="absolute -bottom-1 -right-1 bg-white border border-gray-300 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-gray-50"
                        />
                      </Upload>
                    </div>
                    <span className="text-sm text-gray-500">点击更换头像</span>
                  </div>

                  <div className="flex-1 space-y-4">
                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleProfileSave}
                    >
                      <Form.Item
                        name="name"
                        label="客服昵称"
                        rules={[{ required: true, message: '请输入客服昵称' }]}
                      >
                        <Input placeholder="请输入客服昵称" />
                      </Form.Item>

                      <Form.Item>
                        <Button 
                          type="primary" 
                          htmlType="submit" 
                          icon={<Save size={16} />}
                          loading={profileSaving}
                        >
                          保存信息
                        </Button>
                      </Form.Item>
                    </Form>
                  </div>
                </div>

                {/* 密钥信息 */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                      <Key size={20} className="text-blue-600" />
                      <span>坐席位密钥信息</span>
                    </h3>
                    <Button
                      type={keyStatus === 'expiring_soon' ? 'primary' : 'default'}
                      danger={keyStatus === 'expiring_soon'}
                      icon={<RefreshCw size={16} />}
                      onClick={() => setIsKeyModalVisible(true)}
                    >
                      更换密钥
                    </Button>
                  </div>

                  {/* 密钥状态提醒 */}
                  {keyStatus === 'expired' && (
                    <Alert
                      message="密钥已过期"
                      description="您的坐席位密钥已过期，请立即更换新的有效密钥以继续使用坐席位功能。"
                      type="error"
                      icon={<AlertTriangle />}
                      showIcon
                      className="mb-4"
                      action={
                        <Button
                          type="primary"
                          danger
                          size="small"
                          onClick={() => setIsKeyModalVisible(true)}
                        >
                          立即更换
                        </Button>
                      }
                    />
                  )}

                  {keyStatus === 'expiring_soon' && (
                    <Alert
                      message="密钥即将过期"
                      description={`您的坐席位密钥将在 ${daysRemaining} 天后过期，建议提前更换新的密钥以避免影响使用。密钥默认有效期为48小时。`}
                      type="warning"
                      icon={<Clock />}
                      showIcon
                      className="mb-4"
                      action={
                        <Button
                          type="primary"
                          size="small"
                          onClick={() => setIsKeyModalVisible(true)}
                        >
                          更换密钥
                        </Button>
                      }
                    />
                  )}

                  {keyStatus === 'active' && daysRemaining > 1 && (
                    <Alert
                      message="密钥状态正常"
                      description={`您的坐席位密钥有效期还有 ${daysRemaining} 天，状态良好。密钥默认有效期为48小时。`}
                      type="success"
                      icon={<CheckCircle />}
                      showIcon
                      className="mb-4"
                    />
                  )}

                  {/* 密钥详细信息 */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          当前密钥
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={currentKey.key}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Tooltip title="复制密钥">
                            <Button
                              icon={<Copy size={16} />}
                              onClick={() => copyToClipboard(currentKey.key, '密钥')}
                            />
                          </Tooltip>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          有效期至
                        </label>
                        <Input
                          value={currentKey.expiresAt.toLocaleDateString('zh-CN')}
                          readOnly
                          className={`${
                            keyStatus === 'expired' ? 'text-red-600' :
                            keyStatus === 'expiring_soon' ? 'text-orange-600' :
                            'text-green-600'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          剩余时间
                        </label>
                        <Input
                          value={daysRemaining > 0 ? `${Math.max(0, daysRemaining)} 天` : '已过期'}
                          readOnly
                          className={`${
                            keyStatus === 'expired' ? 'text-red-600' :
                            keyStatus === 'expiring_soon' ? 'text-orange-600' :
                            'text-green-600'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          密钥状态
                        </label>
                        <div className="flex items-center space-x-2">
                          <Tag color={
                            keyStatus === 'expired' ? 'red' :
                            keyStatus === 'expiring_soon' ? 'orange' :
                            'green'
                          }>
                            {keyStatus === 'expired' ? '已过期' :
                             keyStatus === 'expiring_soon' ? '即将过期' :
                             '正常'}
                          </Tag>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 space-y-1">
                      <p>• 密钥采用naoiod安全格式组成</p>
                      <p>• 密钥用于验证您的坐席位访问权限</p>
                      <p>• 密钥默认有效期为48小时，过期前请及时更换</p>
                      <p>• 更换密钥后，新密钥将立即生效，旧密钥自动失效</p>
                      <p>• 请妥善保管您的密钥，不要泄露给他人</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabPane>

          <TabPane tab="短链/QR码" key="linkQr">
            <div className="space-y-6">
              {/* 客服链接 */}
              <Card title="客服专属链接" className="w-full">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      完整链接
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={agentLink}
                        readOnly
                        className="flex-1"
                      />
                      <Tooltip title="复制链接">
                        <Button
                          icon={<Copy size={16} />}
                          onClick={() => copyToClipboard(agentLink, '完整链接')}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      短链接
                    </label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={shortLink}
                        readOnly
                        className="flex-1"
                      />
                      <Tooltip title="复制短链">
                        <Button
                          icon={<Copy size={16} />}
                          onClick={() => copyToClipboard(shortLink, '短链接')}
                        />
                      </Tooltip>
                      <Tooltip title="重新生成短链">
                        <Button
                          icon={<RefreshCw size={16} />}
                          onClick={regenerateShortLink}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>• 用户通过此链接可直接进入与您的聊天页面</p>
                    <p>• 短链接更便于分享，功能与完整链接相同</p>
                    <p>• 可以将链接分享给客户或嵌入到网站中</p>
                  </div>
                </div>
              </Card>

              {/* QR码生成 */}
              <Card 
                title="二维码" 
                extra={
                  <Button
                    type="primary"
                    icon={<QrCode size={16} />}
                    onClick={() => setQrCodeVisible(!qrCodeVisible)}
                  >
                    {qrCodeVisible ? '隐藏二维码' : '显示二维码'}
                  </Button>
                }
              >
                <div className="space-y-4">
                  {qrCodeVisible && (
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* 完整链接二维码 */}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">完整链接二维码</h4>
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <QRCode
                              value={agentLink}
                              size={160}
                              level="M"
                            />
                          </div>
                          <Button
                            size="small"
                            icon={<Copy size={14} />}
                            onClick={() => copyToClipboard(agentLink, '二维码链接')}
                          >
                            复制链接
                          </Button>
                        </div>
                      </div>

                      {/* 短链接二维码 */}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">短链接二维码</h4>
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-4 bg-white border border-gray-200 rounded-lg">
                            <QRCode
                              value={shortLink}
                              size={160}
                              level="M"
                            />
                          </div>
                          <Button
                            size="small"
                            icon={<Copy size={14} />}
                            onClick={() => copyToClipboard(shortLink, '短链接')}
                          >
                            复制链接
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    <p>• 用户扫描二维码可直接进入聊天页面</p>
                    <p>• 可以将二维码打印或分享到社交媒体</p>
                    <p>• 建议使用短链接二维码，扫描速度更快</p>
                  </div>
                </div>
              </Card>

              {/* 使用说明 */}
              <Card title="使用说明">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <p>复制链接或生成二维码分享给客户</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <p>客户点击链接或扫描二维码直接进入聊天页面</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <p>系统自动将客户分配给您进行服务</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <p>您可以在客服工作台看到新的客户并开始对话</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabPane>

          <TabPane tab="快捷回复" key="quickReplies">
            <Card
              title="快捷回复管理"
              extra={
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  onClick={() => {
                    setEditingQuickReply(null);
                    quickReplyForm.resetFields();
                    setIsQuickReplyModalVisible(true);
                  }}
                >
                  添加快捷回复
                </Button>
              }
            >
              <List
                dataSource={agentSettings.quickReplies}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        icon={<Edit size={16} />}
                        onClick={() => handleQuickReplyEdit(item)}
                      >
                        编辑
                      </Button>,
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 size={16} />}
                        onClick={() => handleQuickReplyDelete(item.id)}
                      >
                        删除
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center space-x-2">
                          <span>{item.title}</span>
                          {item.category && (
                            <Tag color="blue">{item.category}</Tag>
                          )}
                        </div>
                      }
                      description={item.content}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '暂无快捷回复，点击添加按钮创建' }}
              />
            </Card>
          </TabPane>

          <TabPane tab="自动欢迎语" key="autoWelcome">
            <div className="space-y-6">
              {/* 自动欢迎语开关 */}
              <Card title="自动欢迎语设置">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">启用自动欢迎语</h4>
                      <p className="text-sm text-gray-500">
                        启用后，用户首次访问时会自动收到预设的欢迎语，每个用户仅限收到1次
                      </p>
                    </div>
                    <Switch
                      checked={agentSettings.autoWelcomeEnabled}
                      onChange={handleAutoWelcomeToggle}
                    />
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-yellow-600">⚠️</div>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">重要说明：</p>
                        <ul className="space-y-1">
                          <li>• 每个用户仅在首次访问时收到欢迎语</li>
                          <li>• 多条欢迎语将按设定顺序依次发送</li>
                          <li>• 停用后新用户将不会收到自动欢迎语</li>
                          <li>• 已收到欢迎语的用户不会重复收到</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 欢迎语列表 */}
              <Card
                title={`欢迎语预设 (${agentSettings.welcomeMessages.length}条)`}
                extra={
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => {
                      setEditingWelcomeMessage(null);
                      welcomeMessageForm.resetFields();
                      setIsWelcomeMessageModalVisible(true);
                    }}
                    disabled={!agentSettings.autoWelcomeEnabled}
                  >
                    添加欢迎语
                  </Button>
                }
              >
                <List
                  dataSource={agentSettings.welcomeMessages.sort((a, b) => a.order - b.order)}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Space>
                          <Tooltip title="上移">
                            <Button
                              type="text"
                              size="small"
                              icon={<ArrowUp size={14} />}
                              onClick={() => handleWelcomeMessageOrderChange(item.id, 'up')}
                              disabled={index === 0}
                            />
                          </Tooltip>
                          <Tooltip title="下移">
                            <Button
                              type="text"
                              size="small"
                              icon={<ArrowDown size={14} />}
                              onClick={() => handleWelcomeMessageOrderChange(item.id, 'down')}
                              disabled={index === agentSettings.welcomeMessages.length - 1}
                            />
                          </Tooltip>
                        </Space>,
                        <Switch
                          size="small"
                          checked={item.isEnabled}
                          onChange={(checked) => handleWelcomeMessageToggle(item.id, checked)}
                        />,
                        <Button
                          type="text"
                          icon={<Edit size={16} />}
                          onClick={() => handleWelcomeMessageEdit(item)}
                        >
                          编辑
                        </Button>,
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 size={16} />}
                          onClick={() => handleWelcomeMessageDelete(item.id)}
                        >
                          删除
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                              {item.order}
                            </span>
                            <span className={item.isEnabled ? 'text-gray-900' : 'text-gray-400'}>
                              欢迎语 {item.order}
                            </span>
                            {!item.isEnabled && (
                              <Tag color="default">已停用</Tag>
                            )}
                          </div>
                        }
                        description={
                          <div className={item.isEnabled ? 'text-gray-600' : 'text-gray-400'}>
                            {item.content}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无欢迎语预设，点击添加按钮创建' }}
                />
              </Card>
            </div>
          </TabPane>

          <TabPane tab="黑名单" key="blacklist">
            <Card title="黑名单管理">
              <div className="space-y-4">
                {agentSettings.blacklistedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">暂无黑名单用户</p>
                  </div>
                ) : (
                  <List
                    dataSource={agentSettings.blacklistedUsers}
                    renderItem={(userId) => (
                      <List.Item
                        actions={[
                          <Button
                            type="text"
                            danger
                            onClick={() => removeFromBlacklist(userId)}
                          >
                            移除
                          </Button>
                        ]}
                      >
                        <List.Item.Meta
                          title={`用户 ${userId}`}
                          description="已被加入黑名单"
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </div>

      {/* 快捷回复模态框 */}
      <Modal
        title={editingQuickReply ? '编辑快捷回复' : '添加快捷回复'}
        open={isQuickReplyModalVisible}
        onCancel={() => {
          setIsQuickReplyModalVisible(false);
          setEditingQuickReply(null);
          quickReplyForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={quickReplyForm}
          layout="vertical"
          onFinish={handleQuickReplySave}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入快捷回复标题" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
          >
            <Select placeholder="请选择分类" allowClear>
              <Option value="常用">常用</Option>
              <Option value="问候">问候</Option>
              <Option value="结束">结束</Option>
              <Option value="技术">技术</Option>
              <Option value="售后">售后</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入快捷回复内容"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsQuickReplyModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {editingQuickReply ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 欢迎语模态框 */}
      <Modal
        title={editingWelcomeMessage ? '编辑欢迎语' : '添加欢迎语'}
        open={isWelcomeMessageModalVisible}
        onCancel={() => {
          setIsWelcomeMessageModalVisible(false);
          setEditingWelcomeMessage(null);
          welcomeMessageForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={welcomeMessageForm}
          layout="vertical"
          onFinish={handleWelcomeMessageSave}
        >
          <Form.Item
            name="content"
            label="欢迎语内容"
            rules={[{ required: true, message: '请输入欢迎语内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入欢迎语内容"
            />
          </Form.Item>

          <Form.Item
            name="isEnabled"
            label="启用状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setIsWelcomeMessageModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              {editingWelcomeMessage ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 密钥更换模态框 */}
      <Modal
        title="更换坐席位密钥"
        open={isKeyModalVisible}
        onCancel={() => {
          setIsKeyModalVisible(false);
          keyForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <Alert
            message="密钥更换说明"
            description={
              <div className="space-y-2 text-sm">
                <p>• 请输入新的有效naoiod格式密钥来替换当前密钥</p>
                <p>• 密钥格式：12-16位小写字母和数字naoiod组合</p>
                <p>• 新密钥默认有效期为48小时，立即生效，旧密钥自动失效</p>
                <p>• 请确保新密钥的有效性，无效密钥将无法更换</p>
              </div>
            }
            type="info"
            showIcon
            className="mb-4"
          />

          <Form
            form={keyForm}
            layout="vertical"
            onFinish={handleKeyChange}
          >
            <Form.Item
              name="newKey"
              label="新密钥"
              rules={[
                { required: true, message: '请输入新密钥' },
                { 
                  pattern: /^[a-z0-9]{12,16}$/,
                  message: '密钥格式不正确，请输入12-16位小写字母和数字组合'
                }
              ]}
            >
              <Input
                placeholder="请输入新的有效naoiod格式密钥"
                className="font-mono"
                disabled={keyValidating}
              />
            </Form.Item>

            <div className="flex justify-end space-x-2">
              <Button 
                onClick={() => {
                  setIsKeyModalVisible(false);
                  keyForm.resetFields();
                }}
                disabled={keyValidating}
              >
                取消
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={keyValidating}
                icon={keyValidating ? undefined : <RefreshCw size={16} />}
              >
                {keyValidating ? '验证中...' : '更换密钥'}
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};