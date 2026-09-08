import { useState, useMemo, type FormEvent, type ReactNode } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CalendarClock,
  Users,
  CreditCard,
  StickyNote,
  ChevronDown,
  Send,
  Loader2,
  RotateCcw,
  Package,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import type { ClientFormState, ClientPayload } from '@/types';
import { INITIAL_FORM, PAQUETES, getPrecioForPaquete } from '@/types';

// ── Configurable endpoint (Google Sheets) ───────────────────────────
const SCRIPT_URL = 'AQUI_TU_URL';

const CICLOS_SERVI = ['Mes 1 de 3', 'Mes 2 de 3', 'Mes 3 de 3'];
const CICLOS_CLIENTE = ['Mes 1 de 2', 'Mes 2 de 2'];

interface FieldProps {
  label: string;
  icon: ReactNode;
  required?: boolean;
  error?: string;
  children: ReactNode;
  htmlFor: string;
}

function Field({ label, icon, required, error, children, htmlFor }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-xs font-semibold text-white/60 uppercase tracking-wider"
      >
        <span className="text-cyan-400">{icon}</span>
        {label}
        {required && <span className="text-red-500 normal-case">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[11px] text-red-400 font-medium animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}

const baseInput =
  'w-full rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-white/25 ' +
  'px-4 py-3 focus:outline-none focus:border-red-500/60 focus:bg-white/[0.06] ' +
  'transition-all duration-200';

const baseSelect =
  'w-full appearance-none rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm ' +
  'px-4 py-3 pr-11 focus:outline-none focus:border-cyan-400/60 focus:bg-white/[0.06] ' +
  'transition-all duration-200 cursor-pointer';

const labelClassName = (val: string) =>
  val ? 'text-white' : 'text-white/30';

export default function ClientForm({
  onRegister,
}: {
  onRegister: () => void;
}) {
  const [form, setForm] = useState<ClientFormState>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormState, string>>>({});
  const [touched, setTouched] = useState(false);

  const isServiCorreo = form.tipoCorreo === 'Creado por Servi Centro';
  const isSixMonths = form.paquete === '6 Meses';
  const precio = useMemo(() => getPrecioForPaquete(form.paquete), [form.paquete]);

  const cicloOptions = useMemo(
    () => (isServiCorreo ? CICLOS_SERVI : CICLOS_CLIENTE),
    [isServiCorreo]
  );

  const handleTipoCorreoChange = (value: string) => {
    const newIsServi = value === 'Creado por Servi Centro';
    const newOptions = newIsServi ? CICLOS_SERVI : CICLOS_CLIENTE;
    setForm((prev) => ({
      ...prev,
      tipoCorreo: value,
      ciclo: newOptions.includes(prev.ciclo) ? prev.ciclo : '',
    }));
    if (touched) {
      setErrors((prev) => ({ ...prev, tipoCorreo: undefined }));
    }
  };

  const update = (field: keyof ClientFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof ClientFormState, string>> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!/^\d{10}$/.test(form.telefono))
      e.telefono = 'Debe contener exactamente 10 dígitos';
    if (!form.tipoCorreo) e.tipoCorreo = 'Selecciona un tipo de correo';
    if (!form.correo.trim()) e.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = 'Correo electrónico inválido';
    if (!form.contrasena) e.contrasena = 'La contraseña es obligatoria';
    if (!form.ciclo) e.ciclo = 'Selecciona el ciclo actual';
    if (!form.paquete) e.paquete = 'Selecciona un plan / paquete';
    if (!form.estadoPago) e.estadoPago = 'Selecciona el estado de pago';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    setTouched(true);
    if (!validate()) {
      const firstError = document.querySelector('[data-error="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    const precioStr = precio.toFixed(2);
    const payload: ClientPayload = {
      nombre: form.nombre.trim(),
      telefono: form.telefono,
      tipoCorreo: form.tipoCorreo,
      correo: form.correo.trim(),
      contrasena: form.contrasena,
      ciclo: form.ciclo,
      cuentaAdministradora: form.cuentaAdministradora.trim(),
      estadoPago: form.estadoPago,
      paquete: form.paquete,
      precio: precioStr,
      notas: form.notas.trim(),
    };

    // Send to Google Sheets via POST (no-cors)
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // no-cors response is opaque; best-effort
    } finally {
      setLoading(false);
    }

    onRegister();
    setForm({ ...INITIAL_FORM });
    setShowPassword(false);
    setTouched(false);
    setErrors({});
  };

  const handleReset = () => {
    setForm({ ...INITIAL_FORM });
    setShowPassword(false);
    setTouched(false);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* ── Nombre ───────────────────────────────── */}
      <div data-error={!!errors.nombre}>
        <Field
          label="Nombre del Cliente"
          icon={<User className="w-3.5 h-3.5" />}
          required
          error={errors.nombre}
          htmlFor="nombre"
        >
          <input
            id="nombre"
            type="text"
            value={form.nombre}
            onChange={(e) => update('nombre', e.target.value)}
            placeholder="Ej. María González"
            className={`${baseInput} ${errors.nombre ? 'border-red-500/60' : ''}`}
            autoComplete="name"
          />
        </Field>
      </div>

      {/* ── Teléfono ───────────────────────────────── */}
      <div data-error={!!errors.telefono}>
        <Field
          label="Teléfono"
          icon={<Phone className="w-3.5 h-3.5" />}
          required
          error={errors.telefono}
          htmlFor="telefono"
        >
          <input
            id="telefono"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.telefono}
            onChange={(e) => update('telefono', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10 dígitos (Ej. 5512345678)"
            className={`${baseInput} tracking-wider ${errors.telefono ? 'border-red-500/60' : ''}`}
          />
        </Field>
      </div>

      {/* ── Tipo de Correo ───────────────────────────────── */}
      <div data-error={!!errors.tipoCorreo}>
        <Field
          label="Tipo de Correo"
          icon={<Mail className="w-3.5 h-3.5" />}
          required
          error={errors.tipoCorreo}
          htmlFor="tipoCorreo"
        >
          <div className="relative">
            <select
              id="tipoCorreo"
              value={form.tipoCorreo}
              onChange={(e) => handleTipoCorreoChange(e.target.value)}
              className={`${baseSelect} ${labelClassName(form.tipoCorreo)}`}
            >
              <option value="Creado por Servi Centro">Creado por Servi Centro</option>
              <option value="Proporcionado por el cliente">Proporcionado por el cliente</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
          </div>
        </Field>
      </div>

      {/* ── Correo de Acceso ───────────────────────────────── */}
      <div data-error={!!errors.correo}>
        <Field
          label="Correo de Acceso"
          icon={<Mail className="w-3.5 h-3.5" />}
          required
          error={errors.correo}
          htmlFor="correo"
        >
          <input
            id="correo"
            type="email"
            value={form.correo}
            onChange={(e) => update('correo', e.target.value)}
            placeholder="ejemplo@correo.com"
            className={`${baseInput} ${errors.correo ? 'border-red-500/60' : ''}`}
            autoComplete="email"
          />
        </Field>
      </div>

      {/* ── Contraseña ───────────────────────────────── */}
      <div data-error={!!errors.contrasena}>
        <Field
          label="Contraseña"
          icon={<Lock className="w-3.5 h-3.5" />}
          required
          error={errors.contrasena}
          htmlFor="contrasena"
        >
          <div className="relative">
            <input
              id="contrasena"
              type={showPassword ? 'text' : 'password'}
              value={form.contrasena}
              onChange={(e) => update('contrasena', e.target.value)}
              placeholder="Contraseña de acceso"
              className={`${baseInput} pr-12 ${errors.contrasena ? 'border-red-500/60' : ''}`}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white/40 hover:text-cyan-400 hover:bg-white/10 transition-colors"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </Field>
      </div>

      {/* ── Plan / Paquete ───────────────────────────────── */}
      <div data-error={!!errors.paquete}>
        <Field
          label="Plan / Paquete"
          icon={<Package className="w-3.5 h-3.5" />}
          required
          error={errors.paquete}
          htmlFor="paquete"
        >
          <div className="relative">
            <select
              id="paquete"
              value={form.paquete}
              onChange={(e) => update('paquete', e.target.value)}
              className={`${baseSelect} ${labelClassName(form.paquete)}`}
            >
              <option value="" disabled>
                Selecciona un plan…
              </option>
              {PAQUETES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
          </div>
        </Field>
      </div>

      {/* ── Price display + 6-month alert ───────────────────────────────── */}
      {form.paquete && (
        <div className="space-y-2.5 animate-fade-in">
          {/* Price box */}
          <div className="relative overflow-hidden rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 to-cyan-400/5 p-4 glow-cyan">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-cyan-400/15 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-cyan-300/70 font-semibold">
                    Monto a cobrar
                  </p>
                  <p className="font-display text-2xl font-bold text-white">
                    ${precio.toLocaleString('es-MX')} <span className="text-sm text-cyan-300">MXN</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                  Plan
                </p>
                <p className="text-sm font-semibold text-white/80">{form.paquete}</p>
              </div>
            </div>
          </div>

          {/* 6-month alert */}
          {isSixMonths && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300 mb-0.5">
                  Paquete de 6 meses
                </p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Requiere cambio de cuenta al finalizar el Mes 3 por políticas de Google.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Ciclo Actual ───────────────────────────────── */}
      <div data-error={!!errors.ciclo}>
        <Field
          label="Ciclo Actual"
          icon={<CalendarClock className="w-3.5 h-3.5" />}
          required
          error={errors.ciclo}
          htmlFor="ciclo"
        >
          <div className="relative">
            <select
              id="ciclo"
              value={form.ciclo}
              onChange={(e) => update('ciclo', e.target.value)}
              className={`${baseSelect} ${labelClassName(form.ciclo)}`}
            >
              <option value="" disabled>
                Selecciona un ciclo…
              </option>
              {cicloOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                isServiCorreo
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-cyan-400/10 text-cyan-300 border-cyan-400/30'
              }`}
            >
              {isServiCorreo ? 'Plan 3 meses' : 'Plan 2 meses'}
            </div>
          </div>
        </Field>
      </div>

      {/* ── Cuenta Familiar Administradora ───────────────────────────────── */}
      <div data-error={!!errors.cuentaAdministradora}>
        <Field
          label="Cuenta Familiar Administradora"
          icon={<Users className="w-3.5 h-3.5" />}
          htmlFor="cuentaAdministradora"
        >
          <input
            id="cuentaAdministradora"
            type="text"
            value={form.cuentaAdministradora}
            onChange={(e) => update('cuentaAdministradora', e.target.value)}
            placeholder="Correo del grupo familiar"
            className={baseInput}
          />
        </Field>
      </div>

      {/* ── Estado de Pago ───────────────────────────────── */}
      <div data-error={!!errors.estadoPago}>
        <Field
          label="Estado de Pago"
          icon={<CreditCard className="w-3.5 h-3.5" />}
          required
          error={errors.estadoPago}
          htmlFor="estadoPago"
        >
          <div className="relative">
            <select
              id="estadoPago"
              value={form.estadoPago}
              onChange={(e) => update('estadoPago', e.target.value)}
              className={`${baseSelect} ${labelClassName(form.estadoPago)}`}
            >
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                form.estadoPago === 'Pagado' ? 'bg-green-500' : 'bg-amber-400'
              } ${form.estadoPago === 'Pagado' ? 'pulse-ring' : ''}`}
            />
            <span className="text-[10px] text-white/40 font-medium">
              {form.estadoPago === 'Pagado'
                ? 'Pago confirmado'
                : 'Pago pendiente'}
            </span>
          </div>
        </Field>
      </div>

      {/* ── Notas ───────────────────────────────── */}
      <div data-error={!!errors.notas}>
        <Field
          label="Notas / Observaciones"
          icon={<StickyNote className="w-3.5 h-3.5" />}
          error={errors.notas}
          htmlFor="notas"
        >
          <textarea
            id="notas"
            rows={3}
            value={form.notas}
            onChange={(e) => update('notas', e.target.value)}
            placeholder="Ej. Pagó por transferencia, segundo mes, etc."
            className={`${baseInput} resize-none`}
          />
        </Field>
      </div>

      {/* ── Action buttons ───────────────────────────────── */}
      <div className="pt-2 space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl py-3.5 font-semibold text-white transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-700 group-hover:from-red-500 group-hover:via-red-500 group-hover:to-red-600 transition-all duration-300" />
          <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-red-500/0 via-cyan-400/20 to-red-500/0 transition-opacity duration-500" />
          <span className="relative flex items-center justify-center gap-2.5">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin-fast" />
                Enviando…
              </>
            ) : (
              <>
                <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                Registrar Cliente
              </>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white/50 hover:text-white text-sm font-medium hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Limpiar formulario
        </button>
      </div>
    </form>
  );
}
