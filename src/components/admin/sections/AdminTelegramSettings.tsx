"use client";

import React, { useState } from 'react';
import { 
  Send, 
  KeyRound, 
  Users, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  CheckCircle, 
  RefreshCw, 
  Sparkles 
} from 'lucide-react';
import { TelegramBotSettings } from '../../../services/telegramService';

interface AdminTelegramSettingsProps {
  telegramSettings: TelegramBotSettings;
  setTelegramSettings: React.Dispatch<React.SetStateAction<TelegramBotSettings>>;
  handleSaveTelegramSettings: (e: React.FormEvent) => void;
  handleTestTelegramNotification: () => void;
  isTestingTelegram: boolean;
  telegramTestStatus: { type: 'success' | 'error' | ''; message: string };
}

export const AdminTelegramSettings: React.FC<AdminTelegramSettingsProps> = ({
  telegramSettings,
  setTelegramSettings,
  handleSaveTelegramSettings,
  handleTestTelegramNotification,
  isTestingTelegram,
  telegramTestStatus
}) => {
  const [showBotToken, setShowBotToken] = useState(false);

  const isEnabled = Boolean(telegramSettings?.enabled);
  const botToken = telegramSettings?.botToken || '';
  const chatId = telegramSettings?.chatId || '';
  const notifyOnQuote = Boolean(telegramSettings?.notifyOnQuote);

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-sky-400" />
            <span>Telegram Bot Integratsiyasi</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Sayt orqali qoldirilgan barcha tijorat takliflari va so‘rovlarni real vaqtda Telegram botingizga qabul qiling
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-950 px-4 py-2 rounded-2xl border border-gray-800 shrink-0">
          <span className="text-xs font-semibold text-gray-300">Bot holati:</span>
          <button
            type="button"
            onClick={() => setTelegramSettings(prev => ({ ...prev, enabled: !prev?.enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
              isEnabled ? 'bg-sky-500' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-bold ${isEnabled ? 'text-sky-400' : 'text-gray-500'}`}>
            {isEnabled ? 'Faol' : 'O‘chirilgan'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chap 2 ustun: Sozlamalar formasi */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6">
          <form onSubmit={handleSaveTelegramSettings} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sky-400" />
                <span>Telegram Bot Token (API Token)</span>
              </label>
              <div className="relative">
                <input
                  type={showBotToken ? 'text' : 'password'}
                  required
                  value={botToken}
                  onChange={(e) => setTelegramSettings({ ...telegramSettings, botToken: e.target.value })}
                  placeholder="7890123456:AAH..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono pr-10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowBotToken(!showBotToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer p-1"
                  title={showBotToken ? "Tokenni yashirish" : "Tokenni ko'rsatish"}
                >
                  {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                @BotFather boti tomonidan berilgan maxfiy API token
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Chat ID (Shaxsiy ID yoki Guruh IDsi)</span>
              </label>
              <input
                type="text"
                required
                value={chatId}
                onChange={(e) => setTelegramSettings({ ...telegramSettings, chatId: e.target.value })}
                placeholder="123456789 yoki -100987654321"
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono transition"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Xabarlar boradigan shaxsiy Telegram ID yoki mutaxassislar guruhining IDsi
              </p>
            </div>

            <div className="pt-2 border-t border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-gray-300">Ogohlantirish sozlamalari:</h4>
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={notifyOnQuote}
                  onChange={(e) => setTelegramSettings({ ...telegramSettings, notifyOnQuote: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-950 border-gray-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-gray-900 cursor-pointer"
                />
                <span className="text-xs text-gray-300">Yangi tijorat taklifi / so‘rov kelganda darhol Telegram botga yuborish</span>
              </label>
            </div>

            {telegramTestStatus.message && (
              <div className={`p-4 rounded-2xl text-xs font-medium border flex items-start gap-2.5 ${
                telegramTestStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {telegramTestStatus.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{telegramTestStatus.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-800">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/25 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Sozlamalarni saqlash</span>
              </button>

              <button
                type="button"
                onClick={handleTestTelegramNotification}
                disabled={isTestingTelegram}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-sky-400 border border-sky-500/30 text-xs font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                {isTestingTelegram ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-sky-400" />
                )}
                <span>{isTestingTelegram ? 'Yuborilmoqda...' : '🧪 Test xabarini yuborish'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* O'ng ustun: Qo'llanma */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Botni ulash bo‘yicha qo‘llanma</span>
          </h3>

          <ol className="space-y-4 text-xs text-gray-300">
            <li className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <strong className="text-sky-400 font-bold block mb-1">1. Telegram Bot yaratish:</strong>
              Telegramda <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-mono">@BotFather</a> botiga o‘ting va <code className="bg-gray-900 px-1.5 py-0.5 rounded text-sky-300">/newbot</code> buyrug‘ini yuboring. Botga nom va noyob username bering.
              <p className="text-[11px] text-gray-400 mt-1">So‘ng berilgan <b>HTTP API Token</b>ni nusxalab olib chapdagi maydonga kiriting.</p>
            </li>

            <li className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <strong className="text-sky-400 font-bold block mb-1">2. Chat ID ni olish:</strong>
              Telegramda <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline font-mono">@userinfobot</a> botiga <code className="bg-gray-900 px-1.5 py-0.5 rounded text-sky-300">/start</code> yuboring va <b>Id</b> raqamini nusxalab <b>Chat ID</b> maydoniga kiriting.
              <p className="text-[11px] text-gray-400 mt-1">Agar guruhga yubormoqchi bo‘lsangiz, botni guruhga admin qilib qo‘shing va guruh ID sini kiriting.</p>
            </li>

            <li className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <strong className="text-sky-400 font-bold block mb-1">3. Botni faollashtirish:</strong>
              Yaratgan botingizga kirib, <b>/start</b> tugmasini bir marta bosib qo‘ying (aks holda Telegram bot xabarlarini bloklashi mumkin).
            </li>

            <li className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/40 text-emerald-300">
              <strong className="font-bold block mb-1">4. Sinovdan o‘tkazish:</strong>
              Ma'lumotlarni kiritib <b>"Test xabarini yuborish"</b> tugmasini bosing. Xabar botingizga yetib borsa, integratsiya to‘liq tayyor!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};