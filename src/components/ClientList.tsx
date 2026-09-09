import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  DollarSign,
  TrendingUp,
  Loader2,
  Phone,
  Mail,
  CalendarClock,
  Package,
  AlertTriangle,
  UserCircle,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import type { ClientRecord } from '@/types';

// ── Configurable endpoint (Google Sheets) ───────────────────────────
const SCRIPT_URL = 'AQUI_TU_URL';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso ?? '';
  }
}

function safeNum(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function ClientCard({ client }: { client: ClientRecord }) {
  const isSixMonths = client.paquete === '6 Meses';
  const isPaid = client.estado_pago === 'Pagado';
  const precio = safeNum(client.precio);

  return (
    <div className="rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 p-4 backdrop-blur-sm hover:border-white/20 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500/20 to-cyan-400/20 border border-white/10 flex items-center justify-center flex-shrink-0">
            <UserCircle className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              {client.nombre || 'Sin nombre'}
            </p>
            <p className="text-[10px] text-white/40 mt-0.5">
              Registrado {formatDate(client.created_at)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-white/50">
          <Phone className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <span className="tracking-wider">{client.telefono || '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <Mail className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <span className="truncate" title={client.correo}>{client.correo || '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <Package className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{client.paquete || '—'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/50">
          <CalendarClock className="w-3 h-3 text-cyan-400 flex-shrink-0" />
          <span className="truncate">{client.ciclo || '—'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isPaid
                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
            }`}
          >
            {client.estado_pago || '—'}
          </span>
          <span className="font-display text-sm font-bold text-cyan-300">
            ${precio.toLocaleString('es-MX')} <span className="text-[10px] text-cyan-300/60">MXN</span>
          </span>
        </div>
        {isSixMonths && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30">
            <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
            <span className="text-[9px] font-semibold text-amber-300">Relevo 3+3</span>
          </div>
        )}
      </div>

      {client.notas && (
        <p className="text-[10px] text-white/30 mt-2 italic leading-relaxed">
          "{client.notas}"
        </p>
      )}
    </div>
  );
}

export default function ClientList({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SCRIPT_URL}?action=read`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('Respuesta no es JSON valido');
      }
      let rows: ClientRecord[] = [];
      if (Array.isArray(data)) {
        rows = data as ClientRecord[];
      } else if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).clients)) {
        rows = (data as Record<string, unknown>).clients as ClientRecord[];
      }
      setClients(rows);
    } catch {
      setError('Sin conexion directa a Sheets o sin datos aun.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${SCRIPT_URL}?action=read`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        let data: unknown;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Respuesta no es JSON valido');
        }
        let rows: ClientRecord[] = [];
        if (Array.isArray(data)) {
          rows = data as ClientRecord[];
        } else if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).clients)) {
          rows = (data as Record<string, unknown>).clients as ClientRecord[];
        }
        if (!cancelled) setClients(rows);
      } catch {
        if (cancelled) return;
        setError('Sin conexion directa a Sheets o sin datos aun.');
        setClients([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const safeClients = clients || [];
  const safeFiltered = useMemo(() => {
    const list = safeClients;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.correo || '').toLowerCase().includes(q) ||
        (c.telefono || '').includes(q) ||
        (c.paquete || '').toLowerCase().includes(q)
    );
  }, [safeClients, search]);

  const totalRevenue = useMemo(
    () => safeClients.filter((c) => c.estado_pago === 'Pagado').reduce((sum, c) => sum + safeNum(c.precio), 0),
    [safeClients]
  );
  const pendingRevenue = useMemo(
    () => safeClients.filter((c) => c.estado_pago === 'Pendiente').reduce((sum, c) => sum + safeNum(c.precio), 0),
    [safeClients]
  );
  const activeCount = safeClients.length;
  const sixMonthCount = safeClients.filter((c) => c.paquete === '6 Meses').length;
  const totalEst = safeClients.reduce((s, c) => s + safeNum(c.precio), 0);

  return (
    <div className="space-y-5">
      {/* ── Revenue / stats cards ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-green-300/70 font-semibold">
              Total Cobrado
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-white">
            ${totalRevenue.toLocaleString('es-MX')} <span className="text-xs text-green-300/60">MXN</span>
          </p>
          <p className="text-[10px] text-white/30 mt-1">Ingresos confirmados</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-amber-400/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[10px] uppercase tracking-wider text-amber-300/70 font-semibold">
              Por Cobrar
            </span>
          </div>
          <p className="font-display text-2xl font-bold text-white">
            ${pendingRevenue.toLocaleString('es-MX')} <span className="text-xs text-amber-300/60">MXN</span>
          </p>
          <p className="text-[10px] text-white/30 mt-1">Pagos pendientes</p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3 text-center">
          <Users className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-white">{activeCount}</p>
          <p className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Clientes</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3 text-center">
          <Package className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-white">
            ${totalEst.toLocaleString('es-MX')}
          </p>
          <p className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Total Est.</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3 text-center">
          <AlertTriangle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="font-display text-lg font-bold text-white">{sixMonthCount}</p>
          <p className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">Relevo 3+3</p>
        </div>
      </div>

      {/* ── Search bar ───────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, correo, telefono o plan…"
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/25 pl-10 pr-4 py-3 focus:outline-none focus:border-cyan-400/60 transition-all duration-200"
        />
      </div>

      {/* ── Error card with retry ───────────────────────────────── */}
      {error && !loading && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-5 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-amber-400/15 flex items-center justify-center mx-auto mb-3">
            <WifiOff className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-sm font-semibold text-amber-300 mb-1">
            Sin conexion directa a Sheets o sin datos aun.
          </p>
          <p className="text-[11px] text-amber-200/70 leading-relaxed mb-4">
            Puedes seguir usando el formulario de registro normalmente.
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold hover:bg-amber-400/25 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {/* ── Client list ───────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin-fast" />
        </div>
      ) : error ? null : safeFiltered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-sm text-white/40 font-medium">
            {search ? 'Sin resultados para tu busqueda' : 'Aun no hay clientes registrados'}
          </p>
          <p className="text-[11px] text-white/25 mt-1">
            {search ? 'Intenta con otro termino' : 'Registra tu primer cliente en la pestana "Registro"'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeFiltered.map((client) => (
            <ClientCard key={client.id || client.correo} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
