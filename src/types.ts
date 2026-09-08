export interface ClientFormState {
  nombre: string;
  telefono: string;
  tipoCorreo: string;
  correo: string;
  contrasena: string;
  ciclo: string;
  cuentaAdministradora: string;
  estadoPago: string;
  paquete: string;
  notas: string;
}

export interface ClientPayload {
  nombre: string;
  telefono: string;
  tipoCorreo: string;
  correo: string;
  contrasena: string;
  ciclo: string;
  cuentaAdministradora: string;
  estadoPago: string;
  paquete: string;
  precio: string;
  notas: string;
}

export interface ClientRecord {
  id: string;
  nombre: string;
  telefono: string;
  tipo_correo: string;
  correo: string;
  contrasena: string;
  ciclo: string;
  cuenta_administradora: string;
  estado_pago: string;
  paquete: string;
  precio: number;
  notas: string;
  created_at: string;
}

export const PAQUETES = [
  { label: '1 Mes - $80 MXN', value: '1 Mes', precio: 80 },
  { label: '3 Meses - $180 MXN', value: '3 Meses', precio: 180 },
  { label: '6 Meses - $350 MXN (Cuenta Relevo 3+3)', value: '6 Meses', precio: 350 },
] as const;

export function getPrecioForPaquete(paquete: string): number {
  const found = PAQUETES.find((p) => p.value === paquete);
  return found ? found.precio : 0;
}

export const INITIAL_FORM: ClientFormState = {
  nombre: '',
  telefono: '',
  tipoCorreo: 'Creado por Servi Centro',
  correo: '',
  contrasena: '',
  ciclo: '',
  cuentaAdministradora: '',
  estadoPago: 'Pagado',
  paquete: '',
  notas: '',
};
