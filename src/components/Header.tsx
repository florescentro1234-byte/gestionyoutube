import { Youtube, ShieldCheck, Wifi } from 'lucide-react';

export default function Header({ clientCount }: { clientCount: number }) {
  return (
    <header className="relative">
      {/* Background grid + gradient */}
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative px-5 pt-10 pb-6 sm:pt-14 sm:pb-8 sm:px-8 max-w-2xl mx-auto">
        {/* Brand */}
        <div className="flex items-center justify-between mb-6 animate-float-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-red-500/40 blur-xl rounded-2xl" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center glow-red">
                <Youtube className="w-7 h-7 text-white" strokeWidth={2.2} />
              </div>
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-white leading-tight tracking-tight">
                Servi Centro Digital
              </h1>
              <p className="text-[11px] sm:text-xs text-cyan-400 font-medium tracking-wide neon-cyan">
                GESTIÓN DE CLIENTES · YOUTUBE PREMIUM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-white/70 hidden sm:inline">
              En línea
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="mb-6 animate-float-in" style={{ animationDelay: '0.05s', opacity: 0 }}>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            Registro de <span className="text-red-500 neon-red">Clientes</span>
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            Registra y administra suscripciones de YouTube Premium con un formulario inteligente y dinámico.
          </p>
        </div>

        {/* Stat cards */}
        <div
          className="grid grid-cols-3 gap-3 animate-float-in"
          style={{ animationDelay: '0.1s', opacity: 0 }}
        >
          <div className="rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                Activos
              </span>
            </div>
            <p className="font-display text-xl font-bold text-white">
              {clientCount}
            </p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                Servicio
              </span>
            </div>
            <p className="font-display text-xl font-bold text-white">Premium</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-3.5 h-3.5 rounded-full bg-green-500 pulse-ring" />
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                Estado
              </span>
            </div>
            <p className="font-display text-xl font-bold text-white">OK</p>
          </div>
        </div>
      </div>
    </header>
  );
}
