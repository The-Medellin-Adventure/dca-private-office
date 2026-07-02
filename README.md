# Private Office — Panel personal de información

App tipo "oficina privada" para organizar documentos, enlaces, imágenes, videos, notas
y tablas propias, agrupados en módulos que tú defines. Hecha con Next.js + Tailwind
+ Supabase (base de datos y almacenamiento de archivos), 100% gratis y sin tarjeta de crédito.

## 1. Requisitos

- Una cuenta de Supabase (gratis, sin tarjeta): https://supabase.com
- Una cuenta de GitHub (donde ya subiste este código)
- Una cuenta de Vercel (gratis, puedes entrar con tu cuenta de GitHub): https://vercel.com

## 2. Crear el proyecto en Supabase

1. Entra a https://supabase.com y crea una cuenta (puedes usar tu GitHub).
2. Haz clic en **"New project"**.
3. Ponle un nombre, crea una contraseña de base de datos (guárdala, aunque no la usarás
   directamente), y elige la región más cercana a ti.
4. Espera 1-2 minutos mientras se crea.

## 3. Crear las tablas de la base de datos

1. En el menú izquierdo, ve a **"SQL Editor"**.
2. Haz clic en **"New query"**.
3. Abre el archivo `supabase-schema.sql` (incluido en este proyecto) con el Bloc de notas,
   copia todo su contenido, y pégalo en el editor de Supabase.
4. Haz clic en **"Run"**. Esto crea las 3 tablas (`modulos`, `items`, `tablas`) y las reglas
   de seguridad necesarias.

## 4. Crear el bucket de almacenamiento (para tus archivos)

1. En el menú izquierdo, ve a **"Storage"**.
2. Haz clic en **"New bucket"**.
3. Nombre exacto: `archivos` (en minúscula).
4. Actívalo como **"Public bucket"**.
5. Guarda.

## 5. Copiar tus credenciales

1. Ve a **Project Settings** (ícono de engranaje) > **API**.
2. Copia el **Project URL** y la clave **anon public**.

## 6. Configurar el proyecto localmente (opcional, para probarlo en tu computador)

```bash
npm install
cp .env.local.example .env.local
```

Pega tus credenciales en `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
NEXT_PUBLIC_OWNER_NAME="Tu nombre"
NEXT_PUBLIC_OWNER_ROLE="Tu profesión"
```

```bash
npm run dev
```

## 7. Desplegar en Vercel

1. En https://vercel.com, **Add New > Project**, selecciona tu repositorio de GitHub.
2. En **Environment Variables**, agrega las mismas 4 variables de arriba.
3. Haz clic en **Deploy**.

Cada vez que subas cambios a GitHub (rama `main`), Vercel actualiza el sitio solo.

## 8. Cómo funciona la app

- **Módulos**: los creas desde "Nuevo módulo" (nombre + ícono).
- **Dentro de un módulo**: agregar archivos, imágenes, videos, enlaces o notas (con nombre
  y observaciones), y crear tablas propias con columnas y filas editables.
- **Contraseñas**: opcionales, por módulo completo o por archivo individual. No hay login
  para ti — la app queda abierta al entrar, y el candado solo protege lo que tú marques.

## 9. Sobre la seguridad

- No hay login para ti. La app usa la "anon key" de Supabase, que solo funciona dentro de
  las reglas que definimos en `supabase-schema.sql` (acceso abierto a tus propias tablas).
- Las contraseñas de módulos/archivos son una capa de privacidad de interfaz (ocultan el
  contenido a simple vista), no un sistema de login bancario.
- Si en el futuro vas a guardar información muy sensible, se puede agregar un login real
  (Supabase Auth con correo y contraseña) y ajustar las reglas para exigir tu usuario
  específico. Puedo ayudarte con eso cuando quieras dar ese paso.

## 10. Estructura del proyecto

```
app/
  page.js                  → Dashboard principal
  modulos/page.js          → Listado de todos los módulos
  modulos/nuevo/page.js    → Crear módulo
  modulos/[id]/page.js     → Detalle de módulo (archivos + tablas)
components/                → Piezas de interfaz reutilizables
lib/supabase.js            → Conexión a Supabase (base de datos + archivos)
lib/crypto.js              → Hash de contraseñas (SHA-256)
supabase-schema.sql        → Script para crear las tablas y la seguridad
```
