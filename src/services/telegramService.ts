import { QuoteRequestData } from '../types';

export interface TelegramBotSettings {
  enabled: boolean;
  botToken: string;
  chatId: string;
  notifyOnQuote: boolean;
  notifyOnContact: boolean;
}

let memoryTelegramSettings: TelegramBotSettings = {
  enabled: true,
  botToken: '',
  chatId: '',
  notifyOnQuote: true,
  notifyOnContact: true
};

export const TelegramService = {
  getSettings(): TelegramBotSettings {
    return memoryTelegramSettings;
  },

  saveSettings(settings: TelegramBotSettings): boolean {
    memoryTelegramSettings = settings;
    window.dispatchEvent(new CustomEvent('maxtron_telegram_updated', { detail: settings }));
    return true;
  },

  async sendRawMessage(botToken: string, chatId: string, messageHtml: string): Promise<{ success: boolean; error?: string }> {
    if (!botToken || !chatId) {
      return { success: false, error: 'Telegram Bot Token ва Chat ID киритилмаган' };
    }

    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: messageHtml,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        const errorMsg = data.description || `Хатолик коди: ${response.status}`;
        console.error('Telegram API error:', data);
        return { success: false, error: errorMsg };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Telegram network error:', error);
      return { success: false, error: error.message || 'Сарвер билан уланишда хатолик' };
    }
  },

  async sendTestNotification(botToken: string, chatId: string): Promise<{ success: boolean; error?: string }> {
    const testMessage = `
⚡️ <b>MAXTRON — Тест хабари!</b>

✅ Telegram Бот муваффақиятли уланди!
📅 Вақт: ${new Date().toLocaleString('uz-UZ')}

Энди сайт орқали юборилган барча янги буюртма ва сўровлар ушбу чатга келиб тушади.
    `.trim();

    return this.sendRawMessage(botToken, chatId, testMessage);
  },

  async sendQuoteNotification(quote: QuoteRequestData & { productName?: string; id?: string }): Promise<boolean> {
    const settings = this.getSettings();
    if (!settings.enabled || !settings.botToken || !settings.chatId || !settings.notifyOnQuote) {
      return false;
    }

    const message = `
📦 <b>ЯНГИ БУЮРТМА / СЎРОВ (#${quote.id || 'N/A'})</b>

🏢 <b>Корхона:</b> ${quote.companyName}
👤 <b>МАСЪУЛ:</b> ${quote.contactPerson}
📞 <b>Телефон:</b> ${quote.phone}
📧 <b>Email:</b> ${quote.email || 'Кўрсатилмаган'}
🆔 <b>ИНН:</b> ${quote.inn || 'Кўрсатилмаган'}

⚙️ <b>Маҳсулот:</b> ${quote.productName || 'Умумий сўров'}
🔢 <b>Сони:</b> ${quote.quantity || 1} дона
📝 <b>Изоҳ:</b> ${quote.notes || 'Йўқ'}

📅 <b>Вақт:</b> ${new Date().toLocaleString('uz-UZ')}
    `.trim();

    const res = await this.sendRawMessage(settings.botToken, settings.chatId, message);
    return res.success;
  }
};
