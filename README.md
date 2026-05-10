# 🎬 Director's Vault

> Tu bóveda personal de cine. Rastrea, califica, y organiza tu mundo cinematográfico.

## Stack

| Capa | Tecnología |
|:---|:---|
| **Frontend** | Next.js 16 (App Router, Turbopack) |
| **Styling** | Vanilla CSS (Custom Design System) |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth (Google OAuth + Email/Password) |
| **API** | TMDB v3 |
| **Animations** | Framer Motion |
| **Deploy** | Vercel |

## Features

- 🔍 Búsqueda de películas en tiempo real (TMDB)
- ⭐ Rating personal (0.5 - 10.0)
- 📊 Ranking personal de mejor a peor
- ⏳ Lista de "Quiero Ver"
- 📁 Colecciones por director, actor, género, saga, o custom
- 🔥 Trending semanal
- 🎬 Detalle completo: cast, director, recomendaciones
- 📱 Mobile-first + Desktop sidebar
- 🔐 Auth con Google + Email/Password

## Setup Local

```bash
# Clonar
git clone https://github.com/dux14/directors-vault.git
cd directors-vault

# Instalar dependencias
npm install

# Configurar credenciales
cp .env.example .env.local
# Editar .env.local con tus keys

# Desarrollo
npm run dev
```

## Variables de Entorno

Ver `.env.example` para la plantilla completa.

## Licencia

MIT
