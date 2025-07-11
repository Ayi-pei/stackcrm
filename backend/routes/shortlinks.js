import express from 'express';
import { supabase } from '../config/supabase.js';
import { generateShortId } from '../utils/keyGenerator.js';

const router = express.Router();

// 生成短链接
router.post('/shorten', async (req, res) => {
  try {
    const { longUrl, agentId } = req.body;

    if (!longUrl) {
      return res.status(400).json({
        error: 'MISSING_URL',
        message: '请提供要缩短的URL'
      });
    }

    // 生成唯一的短链ID
    let shortId;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortId = generateShortId();
      attempts++;
      
      // 检查短链ID是否已存在
      const { data: existingLink } = await supabase
        .from('short_links')
        .select('id')
        .eq('short_id', shortId)
        .single();

      if (!existingLink) {
        break;
      }

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique short ID');
      }
    } while (true);

    // 保存短链接
    const { data: newShortLink, error } = await supabase
      .from('short_links')
      .insert({
        short_id: shortId,
        original_url: longUrl,
        agent_id: agentId || null,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 生成完整的短链接URL
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const shortUrl = `${baseUrl}/s/${shortId}`;

    res.json({
      success: true,
      data: {
        shortId,
        shortUrl,
        originalUrl: longUrl,
        createdAt: newShortLink.created_at
      }
    });

  } catch (error) {
    console.error('Create short link error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '创建短链接失败'
    });
  }
});

// 解析短链接
router.get('/resolve/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;

    const { data: shortLink, error } = await supabase
      .from('short_links')
      .select('*')
      .eq('short_id', shortId)
      .eq('is_active', true)
      .single();

    if (error || !shortLink) {
      return res.status(404).json({
        error: 'SHORT_LINK_NOT_FOUND',
        message: '短链接不存在或已失效'
      });
    }

    // 检查是否过期
    if (shortLink.expires_at && new Date(shortLink.expires_at) < new Date()) {
      return res.status(404).json({
        error: 'SHORT_LINK_EXPIRED',
        message: '短链接已过期'
      });
    }

    // 增加点击计数
    await supabase
      .from('short_links')
      .update({ 
        click_count: shortLink.click_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', shortLink.id);

    res.json({
      success: true,
      data: {
        originalUrl: shortLink.original_url,
        agentId: shortLink.agent_id,
        clickCount: shortLink.click_count + 1
      }
    });

  } catch (error) {
    console.error('Resolve short link error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '解析短链接失败'
    });
  }
});

// 获取短链接统计
router.get('/stats/:shortId', async (req, res) => {
  try {
    const { shortId } = req.params;

    const { data: shortLink, error } = await supabase
      .from('short_links')
      .select('*')
      .eq('short_id', shortId)
      .single();

    if (error || !shortLink) {
      return res.status(404).json({
        error: 'SHORT_LINK_NOT_FOUND',
        message: '短链接不存在'
      });
    }

    res.json({
      success: true,
      data: {
        shortId: shortLink.short_id,
        originalUrl: shortLink.original_url,
        clickCount: shortLink.click_count,
        isActive: shortLink.is_active,
        createdAt: shortLink.created_at,
        expiresAt: shortLink.expires_at
      }
    });

  } catch (error) {
    console.error('Get short link stats error:', error);
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: '获取短链接统计失败'
    });
  }
});

export default router;