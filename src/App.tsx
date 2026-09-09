import { useState, useCallback } from 'react';
import { ShieldCheck, UserPlus, Users } from 'lucide-react';
import Header from '@/components/Header';
import ClientForm from '@/components/ClientForm';
import ClientList from '@/components/ClientList';
import Toast from '@/components/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

type Tab = 'registro' | 'clientes';

function App() {
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('registro');
  const [clientCount, setClientCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRegistered = useCallback(() => {
    setClientCount((c) => c + 1);
    setRefreshKey((k) => k + 1);
    setToast('Cliente registrado con éxito');
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="relative">
        <Header clientCount={clientCount} />

        <main className="px-5 pb-10 sm:px-8 max-w-2xl mx-auto">
          {/* Tab navigation */}
          <div
            className="flex gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm mb-5 animate-float-in"
            style={{ animationDelay: '0.12s', opacity: 0 }}
          >
            <button
              onClick={() => setTab('registro')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                tab === 'registro'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white glow-red'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Registro
            </button>
            <button
              onClick={() => setTab('clientes')}
              className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                tab === 'clientes'
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white glow-cyan'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              Clientes y Familias
              {clientCount > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tab === 'clientes'
                      ? 'bg-white/20 text-white'
                      : 'bg-cyan-400/15 text-cyan-300'
                  }`}
                >
                  {clientCount}
                </span>
              )}
            </button>
          </div>

          {/* Tab content — wrapped in Error Boundary so a crash in one tab never blacks out the whole app */}
          <ErrorBoundary>
            {tab === 'registro' ? (
              <div
                className="rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 p-5 sm:p-7 backdrop-blur-sm animate-float-in shadow-2xl shadow-black/40"
                style={{ animationDelay: '0.15s', opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-base font-bold text-white">
                    Nuevo Cliente
                  </h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[10px] font-semibold text-cyan-300 uppercase tracking-wider">
                      Seguro
                    </span>
                  </div>
                </div>

                <ClientForm onRegister={handleRegistered} />
              </div>
            ) : (
              <div
                className="rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 p-5 sm:p-7 backdrop-blur-sm animate-float-in shadow-2xl shadow-black/40"
                style={{ animationDelay: '0.15s', opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display text-base font-bold text-white">
                    Clientes y Familias
                  </h3>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                    <Users className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] font-semibold text-red-300 uppercase tracking-wider">
                      {clientCount} Activos
                    </span>
                  </div>
                </div>

                <ClientList refreshKey={refreshKey} />
              </div>
            )}
          </ErrorBoundary>

          <footer className="mt-8 text-center">
            <p className="text-[11px] text-white/30 font-medium">
              Servi Centro Digital · Sistema de gestión de suscripciones YouTube Premium
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
