-- ============================================================
-- Esquema de base de datos para "Private Office"
-- Copia y pega TODO este archivo en Supabase > SQL Editor > New query
-- y dale clic en "Run" (una sola vez).
-- ============================================================

create extension if not exists "pgcrypto";

-- Módulos (Jurídico, Finanzas, Vehículos, etc.)
create table if not exists modulos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  icono text,
  protegido boolean default false,
  password_hash text,
  orden bigint default extract(epoch from now()) * 1000,
  creado_en timestamptz default now()
);

-- Archivos, imágenes, videos, enlaces y notas dentro de cada módulo
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid references modulos(id) on delete cascade,
  tipo text not null,
  nombre text not null,
  observaciones text,
  url text,
  storage_path text,
  nota text,
  protegido boolean default false,
  password_hash text,
  creado_en timestamptz default now()
);

-- Tablas propias dentro de cada módulo (columnas y filas en formato flexible)
create table if not exists tablas (
  id uuid primary key default gen_random_uuid(),
  modulo_id uuid references modulos(id) on delete cascade,
  nombre text not null,
  columnas jsonb default '["Columna 1", "Columna 2"]'::jsonb,
  filas jsonb default '[]'::jsonb,
  creado_en timestamptz default now()
);

-- ============================================================
-- Seguridad: como la app no usa login, dejamos acceso abierto
-- a través de la "anon key" (que solo tú tienes en tus variables
-- de entorno). Esto es equivalente a como estaba configurado en
-- Firebase con autenticación anónima.
-- ============================================================

alter table modulos enable row level security;
alter table items enable row level security;
alter table tablas enable row level security;

create policy "acceso app modulos" on modulos for all using (true) with check (true);
create policy "acceso app items" on items for all using (true) with check (true);
create policy "acceso app tablas" on tablas for all using (true) with check (true);

-- ============================================================
-- Seguridad para el almacenamiento de archivos (bucket "archivos").
-- Debes crear el bucket manualmente en Storage antes de correr esto
-- (ver guía paso a paso). Esto permite que la app pueda subir y leer
-- archivos de ese bucket específico.
-- ============================================================

create policy "acceso app storage archivos"
on storage.objects for all
using (bucket_id = 'archivos')
with check (bucket_id = 'archivos');
