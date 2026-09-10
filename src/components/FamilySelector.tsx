import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ChevronDown,
  Plus,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { FamilyWithUsage } from '@/types';
import { SCRIPT_URL, MAX_CUPOS } from '@/lib/config';

const baseSelect =
  'w-full appearance-none rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm ' +
  'px-4 py-3 pr-11 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.06] ' +
  'transition-all duration-200 cursor-pointer';

const baseInput =
  'w-full rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/25 ' +
  'px-4 py-3 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.06] transition-all duration-200';

interface Props {
  value: string;
  onChange: (value: string) => void;
  refreshKey: number;
  onFamilyCreated: () => void;
}

export default function FamilySelector({
  value,
  onChange,
  refreshKey,
  onFamilyCreated,
}: Props) {
  const [families, setFamilies] = useState<FamilyWithUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

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

  const handleCreate = async () => {
    const email = newAdmin.trim();
    if (!email) {
      setModalError('El correo es obligatorio');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setModalError('Correo electronico invalido');
      return;
    }
    setCreating(true);
    setModalError(null);
    try {
      const payload = {
        action: 'createFamily',
        accion: 'crearFamilia',
        correoAdmin: email,
        correo: email,
        adminEmail: email,
        cuentaAdministradora: email,
      };
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setNewAdmin('');
      setShowModal(false);
      onFamilyCreated();
      await load();
      onChange(email);
    } catch {
      setModalError('Error al crear la familia');
    } finally {
      setCreating(false);
    }
  };

  const labelClassName = (val: string) =>
    val ? 'text-white' : 'text-white/30';

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="cuentaAdministradora"
        className="flex items-center gap-1.5 text-xs font-semibold text-white/60 uppercase tracking-wider"
      >
        <span className="text-cyan-400">
          <Users className="w-3.5 h-3.5" />
        </span>
        Cuenta Familiar Administradora
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          {loading ? (
            <div className={`${baseSelect} flex items-center gap-2`}>
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-white/40">Cargando familias...</span>
            </div>
          ) : error ? (
            <div className={`${baseSelect} text-white/40`} title={error}>
              No hay familias disponibles
            </div>
          ) : (
            <select
              id="cuentaAdministradora"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={`${baseSelect} ${labelClassName(value)}`}
            >
              <option value="" disabled>
                Selecciona una familia...
              </option>
              {families.map((f) => {
                const isFull = f.cuposLibres <= 0;
                const isExpired = f.vencida;
                const label = `${f.correo_admin} (${f.cuposLibres} cupos - ${f.diasRestantes} dias)`;
                return (
                  <option
                    key={f.id}
                    value={f.correo_admin}
                    disabled={isFull || isExpired}
                  >
                    {isFull ? `${f.correo_admin} (LLENA)` : isExpired ? `${f.correo_admin} (VENCIDA)` : label}
                  </option>
                );
              })}
            </select>
          )}
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 flex items-center gap-1 px-3 py-3 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-400/20 transition-colors whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nueva Familia</span>
        </button>
      </div>

      {value && !loading && !error && (
        <div className="flex items-center gap-1.5 mt-1">
          {(() => {
            const fam = families.find((f) => f.correo_admin === value);
            if (!fam) return null;
            const pct = (fam.cuposOcupados / MAX_CUPOS) * 100;
            return (
              <div className="w-full space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fam.cuposLibres <= 0
                          ? 'bg-red-500'
                          : fam.cuposLibres <= 1
                          ? 'bg-amber-400'
                          : 'bg-cyan-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/50 font-medium tabular-nums">
                    {fam.cuposOcupados}/{MAX_CUPOS}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {fam.vencida ? (
                    <span className="text-[10px] text-red-400 font-semibold">
                      VENCIDA - Cambiar administrador
                    </span>
                  ) : (
                    <span
                      className={`text-[10px] font-medium ${
                        fam.diasRestantes <= 5 ? 'text-amber-400' : 'text-white/40'
                      }`}
                    >
                      Quedan {fam.diasRestantes} dias
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0a0c14] border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-400/15 flex items-center justify-center">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="font-display text-base font-bold text-white">
                  Nueva Familia
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewAdmin('');
                  setModalError(null);
                }}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-white/40 leading-relaxed">
                Da de alta un nuevo correo administrador. Tendra 30 dias de vigencia y {MAX_CUPOS} cupos disponibles.
              </p>
              <input
                type="email"
                value={newAdmin}
                onChange={(e) => {
                  setNewAdmin(e.target.value);
                  if (modalError) setModalError(null);
                }}
                placeholder="admin@correo.com"
                className={`${baseInput} ${modalError ? 'border-red-500/60' : ''}`}
                autoFocus
              />
              {modalError && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {modalError}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewAdmin('');
                    setModalError(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-white/50 hover:text-white text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-semibold disabled:opacity-70 transition-all"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {creating ? 'Creando...' : 'Crear Familia'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
