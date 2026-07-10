import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageSender, ConversationStatus, AIMessage } from '@prisma/client';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // 1. SETTINGS HELPER
  // ==========================================

  private async getSetting(key: string, defaultValue: string): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting ? setting.value : defaultValue;
  }

  // ==========================================
  // 2. CONVERSATION MANAGEMENT
  // ==========================================

  async startConversation(customerId: string, title?: string) {
    // Verify customer exists
    const customer = await this.prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return this.prisma.aIConversation.create({
      data: {
        customerId,
        title: title || 'محادثة جديدة',
        status: 'ACTIVE',
      },
    });
  }

  async getConversations(customerId: string) {
    return this.prisma.aIConversation.findMany({
      where: { customerId, status: { not: 'CLOSED' } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConversationHistory(conversationId: string, customerId: string) {
    const conversation = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.customerId !== customerId) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    return conversation;
  }

  // ==========================================
  // 3. CORE SEND MESSAGE & GEMINI CALL
  // ==========================================

  async sendMessage(customerId: string, conversationId: string, messageContent: string) {
    // 1. Verify conversation ownership and status
    const conversation = await this.prisma.aIConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    if (conversation.customerId !== customerId) {
      throw new ForbiddenException('Access denied to this conversation');
    }
    if (conversation.status === 'CLOSED') {
      throw new BadRequestException('Conversation is closed');
    }

    // 2. Load configurations
    const aiEnabled = await this.getSetting('ai_enabled', 'true');
    if (aiEnabled !== 'true') {
      throw new BadRequestException('المساعد الذكي معطل حالياً من قبل الإدارة.');
    }

    const apiKey = await this.getSetting('ai_api_key', '');
    const model = await this.getSetting('ai_model', 'gemini-1.5-flash');
    const temperatureStr = await this.getSetting('ai_temperature', '0.7');
    const temperature = parseFloat(temperatureStr);

    const dailyLimit = parseInt(await this.getSetting('ai_daily_limit', '50'), 10);
    const monthlyLimit = parseInt(await this.getSetting('ai_monthly_limit', '1000'), 10);

    // 3. Enforce Limits Checks
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);

    // Count user messages today
    const dailyCount = await this.prisma.aIMessage.count({
      where: {
        conversation: { customerId },
        sender: 'CUSTOMER',
        createdAt: { gte: startOfToday },
      },
    });

    if (dailyCount >= dailyLimit) {
      throw new ForbiddenException('لقد تجاوزت الحد اليومي المسموح به للمساعد الذكي.');
    }

    // Count user messages this month
    const monthlyCount = await this.prisma.aIMessage.count({
      where: {
        conversation: { customerId },
        sender: 'CUSTOMER',
        createdAt: { gte: startOfMonth },
      },
    });

    if (monthlyCount >= monthlyLimit) {
      throw new ForbiddenException('لقد تجاوزت الحد الشهري المسموح به للمساعد الذكي.');
    }

    // 4. Fetch context/history (last 10 messages)
    const history = await this.prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    // Reverse to chronological order
    history.reverse();

    // 5. Format contents for Gemini (user / model roles mapping)
    const contents = history.map((h: AIMessage) => ({
      role: h.sender === 'CUSTOMER' ? 'user' : 'model',
      parts: [{ text: h.message }],
    }));

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: messageContent }],
    });

    // 6. Define System Prompt
    const systemPrompt = `أنت المساعد الذكي التفاعلي لمنصة "آفاق العرب الذكية" (Afaq Al-Arab Al-Dhakiah)، وهي منصة هندسية وعقارية متكاملة مقرها الرئيسي في اليمن - محافظة ذمار.
مهامك هي:
- مساعدة العملاء في فهم واستعراض العقارات المنشورة.
- توضيح وشرح الخدمات الهندسية التي يقدمها المكتب (مثل: التصميم المعماري، الإنشائي، الداخلي، الكهربائي، المساحي والإشراف الهندسي).
- توضيح وشرح خدمات المقاولات (مثل: المقاولات العامة، التشطيبات، الترميم والصيانة).
- إرشاد العملاء لطريقة تقديم طلبات الخدمات عبر تطبيق الهاتف.
- الإجابة بلغة ودية ومحترفة (بالعربية بشكل أساسي، مع تلبية الإنجليزية إذا طلب العميل).
- كن واضحاً بأن إجاباتك إرشادية وتثقيفية، ولا تغني عن الاستشارة المباشرة لمهندسي المنصة.`;

    const startTime = Date.now();
    let aiResponseText = '';
    let totalTokens = 0;

    // 7. Make API request to Google Gemini
    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: { temperature },
              systemInstruction: { parts: [{ text: systemPrompt }] },
            }),
          },
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || 'Failed to call Gemini API');
        }

        const resData: any = await response.json();
        aiResponseText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        totalTokens = resData?.usageMetadata?.totalTokenCount || 0;
      } catch (error: any) {
        console.error('Gemini API Error:', error);
        aiResponseText = 'عذراً، أواجه مشكلة في الاتصال بخدمة الذكاء الاصطناعي حالياً. يرجى المحاولة مرة أخرى لاحقاً.';
      }
    } else {
      // Mock Fallback if API key is not configured (for initial testing/dev)
      aiResponseText = `[وضع التطوير محلياً] مرحباً بك في آفاق العرب الذكية بذمار. لم يتم تكوين مفتاح Gemini API Key في الإعدادات العامة للمنصة بعد. 
رسالتك كانت: "${messageContent}"`;
    }

    const responseTimeMs = Date.now() - startTime;

    // 8. Store messages in database within transaction
    return this.prisma.$transaction(async (tx) => {
      // Save customer message
      const customerMsg = await tx.aIMessage.create({
        data: {
          conversationId,
          sender: 'CUSTOMER',
          message: messageContent,
        },
      });

      // Save AI message response
      const aiMsg = await tx.aIMessage.create({
        data: {
          conversationId,
          sender: 'AI',
          message: aiResponseText,
          modelUsed: apiKey ? model : 'MOCK_DEV_MODEL',
          tokenUsage: totalTokens,
          responseTimeMs,
        },
      });

      // Update conversation timestamp
      await tx.aIConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return {
        customerMessage: customerMsg,
        aiResponse: aiMsg,
        limits: {
          dailyUsed: dailyCount + 1,
          dailyMax: dailyLimit,
          monthlyUsed: monthlyCount + 1,
          monthlyMax: monthlyLimit,
        },
      };
    });
  }

  // ==========================================
  // 4. USAGE STATISTICS FOR ADMIN
  // ==========================================

  async getUsageStats() {
    const totalConversations = await this.prisma.aIConversation.count();
    const totalMessages = await this.prisma.aIMessage.count();
    const totalTokens = await this.prisma.aIMessage.aggregate({
      _sum: { tokenUsage: true },
    });
    const avgResponseTime = await this.prisma.aIMessage.aggregate({
      _avg: { responseTimeMs: true },
    });

    return {
      totalConversations,
      totalMessages,
      totalTokens: totalTokens._sum.tokenUsage || 0,
      averageResponseTimeMs: Math.round(avgResponseTime._avg.responseTimeMs || 0),
    };
  }
}
