/*
# Create clients table for Servi Centro Digital

1. New Tables
- `clients` — stores YouTube Premium subscription client records
  - `id` (uuid, primary key)
  - `nombre` (text, client name)
  - `telefono` (text, 10-digit phone)
  - `tipo_correo` (text, email type: 'Creado por Servi Centro' or 'Proporcionado por el cliente')
  - `correo` (text, access email)
  - `contrasena` (text, password)
  - `ciclo` (text, current billing cycle)
  - `cuenta_administradora` (text, family group admin email)
  - `estado_pago` (text, 'Pagado' or 'Pendiente')
  - `paquete` (text, plan/package selected)
  - `precio` (numeric, amount to charge in MXN)
  - `notas` (text, optional notes)
  - `created_at` (timestamptz, record creation time)

2. Security
- Enable RLS on `clients`.
- Allow anon + authenticated full CRUD (single-tenant, no sign-in — data is intentionally shared).
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  telefono text NOT NULL,
  tipo_correo text NOT NULL,
  correo text NOT NULL,
  contrasena text NOT NULL,
  ciclo text NOT NULL,
  cuenta_administradora text DEFAULT '',
  estado_pago text NOT NULL DEFAULT 'Pagado',
  paquete text NOT NULL DEFAULT '',
  precio numeric(10,2) NOT NULL DEFAULT 0,
  notas text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_clients" ON clients;
CREATE POLICY "anon_select_clients" ON clients FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_clients" ON clients;
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_clients" ON clients;
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE
  TO anon, authenticated USING (true);
