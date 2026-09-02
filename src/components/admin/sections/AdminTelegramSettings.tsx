import React, { useState } from 'react';
import { Send, KeyRound, Users, Eye, EyeOff, CheckCircle2, XCircle, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-sky-400" />
            Telegram Бот Интеграцияси
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Сайт орқали қолдирилган барча тижорат таклифлари ва сўровларни реал вақтда Telegram ботингизга қабул қилинг
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-gray-950 px-4 py-2 rounded-2xl border border-gray-800">
          <span className="text-xs font-semibold text-gray-300">Бот ҳолати:</span>
          <button
            type="button"
            onClick={() => setTelegramSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              telegramSettings.enabled ? 'bg-sky-500' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                telegramSettings.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-bold ${telegramSettings.enabled ? 'text-sky-400' : 'text-gray-500'}`}>
            {telegramSettings.enabled ? 'Фаол' : 'Ўчирилган'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bot Settings Form */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-6">
          <form onSubmit={handleSaveTelegramSettings} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-sky-400" />
                Telegram Bot Token (API Token)
              </label>
              <div className="relative">
                <input
                  type={showBotToken ? 'text' : 'password'}
                  required
                  value={telegramSettings.botToken}
                  onChange={(e) => setTelegramSettings({ ...telegramSettings, botToken: e.target.value })}
                  placeholder="7890123456:AAH..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowBotToken(!showBotToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                @BotFather боти томонидан берилган махфий токен
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Chat ID (Шахсий ID ёки Гуруҳ IDси)
              </label>
              <input
                type="text"
                required
                value={telegramSettings.chatId}
                onChange={(e) => setTelegramSettings({ ...telegramSettings, chatId: e.target.value })}
                placeholder="123456789 ёки -100987654321"
                className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-sky-500 font-mono"
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Хабарлар борадиган шахсий Telegram ID ёки мутахассислар гуруҳининг IDси
              </p>
            </div>

            <div className="pt-2 border-t border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-gray-300">Огоҳлантириш созламалари:</h4>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={telegramSettings.notifyOnQuote}
                  onChange={(e) => setTelegramSettings({ ...telegramSettings, notifyOnQuote: e.target.checked })}
                  className="w-4 h-4 rounded bg-gray-950 border-gray-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-gray-900"
                />
                <span className="text-xs text-gray-300">Янги тижорат таклифи / сўров келганда дарҳол Telegram'га юбориш</span>
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
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg shadow-sky-500/25"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Созламаларни сақлаш</span>
              </button>

              <button
                type="button"
                onClick={handleTestTelegramNotification}
                disabled={isTestingTelegram}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-sky-400 border border-sky-500/30 text-xs font-bold transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isTestingTelegram ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-sky-400" />
                )}
                <span>{isTestingTelegram ? 'Юборилмоқда...' : '🧪 Тест хабарини юбориш'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Setup Instructions */}
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Ботни улаш бўйича қўлланма
          </h3>

          <ol className="space-y-4 text-xs text-gray-300">
            <li className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <strong className="text-sky-400 font-bold block mb-1">1. Telegram Bot яратиш:</strong>
              Telegram'да <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline font-mono">@BotFather</a> ботига ўтинг ва <code className="bg-gray-900 px-1.5 py-0.5 rounded text-sky-300">/newbot</code> буйруғини юборинг. Ботга ном ва ноёб лақаб беринг.
              <p className="text-[11px] text-gray-400 mt-1">Сўнг берилган <b>HTTP API Token</b>ни нусхалаб олиб юқоридаги майдонга киритинг.</p>
            </li>

            <li className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <strong className="text-sky-400 font-bold block mb-1">2. Chat ID ни олиш:</strong>
              Telegram'да <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-mono">@userinfobot</a> ботига <code className="bg-gray-900 px-1.5 py-0.5 rounded text-sky-300">/start</code> юборинг ва <b>Id</b> рақамини нусхалаб <b>Chat ID</b> майдонига киритинг.
              <p className="text-[11px] text-gray-400 mt-1">Агар гуруҳга юбормоқчи бўлсангиз, ботни гуруҳга админ қилиб қўшинг ва гуруҳ IDсини киритинг.</p>
            </li>

            <li className="bg-gray-950 p-3.5 rounded-2xl border border-gray-800/80 space-y-1">
              <strong className="text-sky-400 font-bold block mb-1">3. Ботни фаоллаштириш:</strong>
              Яратган ботингизга ўтиб, <b>/start</b> тугмасини бир марта босиб қўйинг (акс ҳолда Telegram бегона бот хабарларини блоклаши мумкин).
            </li>

            <li className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-800/40 text-emerald-300">
              <strong className="font-bold block mb-1">4. Синовдан ўтказиш:</strong>
              Барча маълумотларни киритиб <b>"Тест хабарини юбориш"</b> тугмасини босинг. Хабар ботингизга етиб борса, тизим тайёр!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
