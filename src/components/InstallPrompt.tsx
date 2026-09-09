import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem('servicentro-install-dismissed');
      if (!dismissed) {
        window.setTimeout(() => setVisible(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setVisible(false);
      }
    } catch {
      // best-effort
    } finally {
      setDeferredPrompt(null);
      setVisible(false);
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('servicentro-install-dismissed', '1');
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <>
      {/* Mobile bottom banner */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 animate-float-in">
        <div className="m-3 rounded-2xl bg-[#0b0f19] border border-red-500/30 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-[#0b0f19]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">
                  Instala la app de Servi Centro
                </p>
                <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                  Acceso mas rapido y en pantalla completa en tu celular
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold disabled:opacity-70 transition-all active:scale-[0.98]"
              >
                <Smartphone className="w-4 h-4" />
                {installing ? 'Instalando...' : 'Instalar App'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl text-white/50 hover:text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop / tablet floating card */}
      <div className="hidden sm:block fixed bottom-6 right-6 z-50 w-80 animate-float-in">
        <div className="rounded-2xl bg-[#0b0f19] border border-red-500/30 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
          <div className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-[#0b0f19]" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  Instala la app de Servi Centro
                </p>
                <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                  Instala la app de Servi Centro en tu celular para un acceso mas rapido y en pantalla completa
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold disabled:opacity-70 transition-all hover:from-red-500 hover:to-red-600"
              >
                <Smartphone className="w-4 h-4" />
                {installing ? 'Instalando...' : 'Instalar App'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 rounded-xl text-white/50 hover:text-white text-sm font-medium hover:bg-white/5 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
