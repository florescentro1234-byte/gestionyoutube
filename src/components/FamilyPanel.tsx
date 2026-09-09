import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Mail,
  Loader2,
  RefreshCw,
  WifiOff,
  Clock,
  MessageCircle,
  X,
} from 'lucide-react';
import type { FamilyWithUsage } from '@/types';
import { SCRIPT_URL, MAX_CUPOS, VIGENCIA_DIAS } from '@/lib/config';

interface Props {
  refreshKey: number;
  selectedFamily: string | null;
  onSelectFamily: (correo: string | null) => void;
  clientCountByFamily: (correo: string) => number;
}

export default function FamilyPanel({
  refreshKey,
  selectedFamily,
  onSelectFamily,
  clientCountByFamily,
}: Props) {
  const [families, setFamilies] = useState<FamilyWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=readFamilies`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('JSON invalido');
      }
      let rows: FamilyWithUsage[] = [];
      if (Array.isArray(data)) {
        rows = data as FamilyWithUsage[];
      } else if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).families)) {
        rows = (data as Record<string, unknown>).families as FamilyWithUsage[];
      }
      setFamilies(rows);
    } catch {
      setError('No se pudieron cargar las familias');
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [refreshKey, load]);

  const handleRenew = async (correo: string) => {
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'renewFamily', correo_admin: correo }),
      });
      load();
    } catch {
      // best-effort
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-center">
        <div className="w-10 h-10 rounded-full bg-amber-400/15 flex items-center justify-center mx-auto mb-2">
          <WifiOff className="w-5 h-5 text-amber-400" />
        </div>
        <p className="text-xs font-semibold text-amber-300 mb-2">
          No se pudieron cargar las familias
        </p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-semibold hover:bg-amber-400/25 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reintentar
        </button>
      </div>
    );
  }

  if (families.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="w-8 h-8 text-white/15 mx-auto mb-2" />
        <p className="text-xs text-white/40 font-medium">
          No hay familias registradas
        </p>
        <p className="text-[10px] text-white/25 mt-0.5">
          Crea una nueva familia desde el formulario de registro
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedFamily && (
        <button
          onClick={() => onSelectFamily(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-[11px] font-semibold hover:bg-cyan-400/20 transition-colors mb-2"
        >
          <X className="w-3 h-3" />
          Quitar filtro: {selectedFamily}
        </button>
      )}

      <div className="space-y-2.5">
        {families.map((f) => {
          const pct = Math.min((f.cuposOcupados / MAX_CUPOS) * 100, 100);
          const isSelected = selectedFamily === f.correo_admin;
          const isFull = f.cuposLibres <= 0;
          const isExpired = f.vencida;
          const realCount = clientCountByFamily(f.correo_admin);

          return (
            <div
              key={f.id}
              onClick={() => onSelectFamily(isSelected ? null : f.correo_admin)}
              className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-cyan-400/60 bg-cyan-400/10 shadow-lg shadow-cyan-500/10'
                  : isExpired
                  ? 'border-red-500/30 bg-red-500/5 hover:border-red-500/50'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-start justify-between mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isExpired ? 'bg-red-500/15' : 'bg-cyan-400/15'
                  }`}>
                    <Users className={`w-4 h-4 ${isExpired ? 'text-red-400' : 'text-cyan-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 text-white/40 flex-shrink-0" />
                      <span className="truncate">{f.correo_admin}</span>
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {realCount} cliente{realCount !== 1 ? 's' : ''} en esta familia
                    </p>
                  </div>
                </div>

                {isExpired && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                    VENCIDA
                  </span>
                )}
                {isFull && !isExpired && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    LLENA
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40 font-medium">Cupos</span>
                  <span className="text-white/60 font-semibold tabular-nums">
                    {f.cuposOcupados}/{MAX_CUPOS}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull
                        ? 'bg-red-500'
                        : f.cuposLibres <= 1
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Countdown + actions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3 h-3 ${isExpired ? 'text-red-400' : f.diasRestantes <= 5 ? 'text-amber-400' : 'text-white/40'}`} />
                  {isExpired ? (
                    <span className="text-[10px] text-red-400 font-semibold">
                      VENCIDA - Cambiar admin
                    </span>
                  ) : (
                    <span className={`text-[10px] font-medium ${f.diasRestantes <= 5 ? 'text-amber-400' : 'text-white/40'}`}>
                      {f.diasRestantes} dias restantes
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Familia ${f.correo_admin} - ${f.cuposOcupados}/${MAX_CUPOS} cupos`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenew(f.correo_admin);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-semibold hover:bg-cyan-400/20 transition-colors"
                    title={`Renovar ${VIGENCIA_DIAS} dias`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Renovar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


