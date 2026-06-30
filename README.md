# MatchDay

[English](#english) | [Español](#español)

---

## English

### Project description

MatchDay is a football match center web app designed to present match information in a clean, organized, and portfolio-ready interface. It brings together fixtures, competition groupings, match details, timelines, standings previews, lineups, and statistics to create a modern experience for following football matches.

- **Live URL:** [https://matchday-beige-three.vercel.app](https://matchday-beige-three.vercel.app)
- **GitHub repository:** `https://github.com/MarianEsteban/Matchday`

### Features

- Today's matches overview
- Date navigation for browsing fixtures by day
- Match status filters
- Matches grouped by competition
- Competition sidebar for quick navigation
- Match detail page
- Events timeline
- Standings preview
- Lineups section
- Stats section

### Tech stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

### Local development setup

1. Clone the repository:

   ```bash
   git clone https://github.com/MarianEsteban/Matchday
   cd Matchday
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Optional: configure the data mode and real fixtures provider. MatchDay reads `MATCHDAY_DATA_MODE` on the server and defaults to `auto`.

   - `MATCHDAY_DATA_MODE=demo`: always use demo/mock data and never call API-Football. Use this while working on UI/design to avoid consuming daily requests.
   - `MATCHDAY_DATA_MODE=auto`: use API-Football when `FOOTBALL_API_KEY` exists, then fall back to cached API data or demo data on missing keys, request failures, or quota/rate-limit responses.
   - `MATCHDAY_DATA_MODE=api`: prefer API-Football when `FOOTBALL_API_KEY` exists, while still falling back gracefully if the provider fails.

   Do not prefix server variables with `NEXT_PUBLIC_`, do not commit real keys, and keep local secrets in `.env.local` (already ignored by Git).

   ```bash
   MATCHDAY_DATA_MODE=demo
   FOOTBALL_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the app in your browser:

   ```text
   http://localhost:3000
   ```


### API-Football troubleshooting

- Use `MATCHDAY_DATA_MODE=demo` for UI work without API calls. Demo mode never calls API-Football.
- Use `MATCHDAY_DATA_MODE=auto` when you want real API data with safe fallback to cached API-Football data or demo data.
- Keep `FOOTBALL_API_KEY` server-only. Do not use `NEXT_PUBLIC_` and do not commit real keys.
- After changing `.env.local`, restart `npm run dev` so the server reads the updated variables.
- After changing Vercel environment variables, redeploy the project.
- In development, MatchDay logs safe diagnostics for the active mode, key presence, selected date, timezone, queried API dates, API status, quota detection, fixture counts, final visible count, and fallback source. Keys are never printed.

### Deployment

MatchDay is intended to be deployed on Vercel. After connecting the GitHub repository to Vercel, deployments can be triggered automatically from the selected production branch.

Current live deployment:

```text
https://matchday-beige-three.vercel.app
```

### Current status

MatchDay is currently a portfolio project with demo/mock data as its safe fallback. In `auto` or `api` mode with `FOOTBALL_API_KEY` configured, the app tries API-Football first, uses server-side caching to reduce duplicate requests, remembers quota/rate-limit exhaustion during the runtime session, and falls back to cached API-Football data or demo data instead of showing an empty broken app.

### Roadmap

- Expand the live football data API integration beyond fixtures
- Add richer match detail views
- Improve responsive layouts and mobile navigation
- Add team and competition profile pages
- Expand standings, lineups, and statistics coverage
- Add loading, empty, and error states for production data
- Improve accessibility and keyboard navigation
- Add automated tests for key user flows

---

## Español

### Descripción del proyecto

MatchDay es una aplicación web de centro de partidos de fútbol diseñada para presentar información de partidos en una interfaz limpia, organizada y adecuada para un portafolio profesional. Reúne calendarios, competiciones agrupadas, detalles de partidos, cronologías, vistas previas de clasificaciones, alineaciones y estadísticas para ofrecer una experiencia moderna al seguir partidos de fútbol.

- **URL en vivo:** [https://matchday-beige-three.vercel.app](https://matchday-beige-three.vercel.app)
- **Repositorio de GitHub:** `https://github.com/MarianEsteban/Matchday`

### Funcionalidades

- Vista de los partidos de hoy
- Navegación por fecha para explorar partidos por día
- Filtros por estado del partido
- Partidos agrupados por competición
- Barra lateral de competiciones para navegación rápida
- Página de detalle del partido
- Cronología de eventos
- Vista previa de la clasificación
- Sección de alineaciones
- Sección de estadísticas

### Stack tecnológico

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

### Configuración de desarrollo local

1. Clona el repositorio:

   ```bash
   git clone https://github.com/MarianEsteban/Matchday
   cd Matchday
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Opcional: configura el modo de datos y el proveedor real de calendarios. MatchDay lee `MATCHDAY_DATA_MODE` en el servidor y usa `auto` por defecto.

   - `MATCHDAY_DATA_MODE=demo`: usa siempre datos demo/mock y nunca llama a API-Football. Usalo mientras trabajás en UI/diseño para evitar consumir requests diarios.
   - `MATCHDAY_DATA_MODE=auto`: usa API-Football cuando existe `FOOTBALL_API_KEY`, y vuelve a datos de API en caché o datos demo ante claves faltantes, fallos de request o respuestas de cuota/rate-limit.
   - `MATCHDAY_DATA_MODE=api`: prefiere API-Football cuando existe `FOOTBALL_API_KEY`, pero igualmente vuelve a un respaldo seguro si el proveedor falla.

   No uses el prefijo `NEXT_PUBLIC_` para variables del servidor, no subas claves reales y mantené secretos locales en `.env.local` (ya ignorado por Git).

   ```bash
   MATCHDAY_DATA_MODE=demo
   FOOTBALL_API_KEY=tu_api_key_aqui
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre la aplicación en tu navegador:

   ```text
   http://localhost:3000
   ```

### Diagnóstico de API-Football

- Usá `MATCHDAY_DATA_MODE=demo` para trabajar en la UI sin llamadas a la API. El modo demo nunca llama a API-Football.
- Usá `MATCHDAY_DATA_MODE=auto` cuando querés datos reales con respaldo seguro a datos API-Football en caché o datos demo.
- Mantené `FOOTBALL_API_KEY` solo del lado del servidor. No uses `NEXT_PUBLIC_` y no commitees claves reales.
- Después de cambiar `.env.local`, reiniciá `npm run dev` para que el servidor lea las variables nuevas.
- Después de cambiar variables de entorno en Vercel, redeployá el proyecto.
- En desarrollo, MatchDay registra diagnósticos seguros del modo activo, presencia de clave, fecha seleccionada, zona horaria, fechas consultadas en la API, estado de respuesta, cuota/rate-limit, conteos de fixtures, cantidad visible final y fuente de fallback. Las claves nunca se imprimen.

### Despliegue

MatchDay está pensado para desplegarse en Vercel. Después de conectar el repositorio de GitHub con Vercel, los despliegues pueden ejecutarse automáticamente desde la rama de producción seleccionada.

Despliegue actual en vivo:

```text
https://matchday-beige-three.vercel.app
```

### Estado actual

MatchDay es actualmente un proyecto de portafolio con datos demo/mock como respaldo seguro. En modo `auto` o `api` con `FOOTBALL_API_KEY` configurada, la app intenta usar API-Football primero, aplica caché del lado del servidor para reducir requests duplicados, recuerda el agotamiento de cuota/rate-limit durante la sesión de runtime y vuelve a datos de API-Football en caché o datos demo en lugar de mostrar una pantalla vacía.

### Roadmap

- Ampliar la integración de la API de datos de fútbol más allá de los calendarios
- Añadir vistas de detalle de partido más completas
- Mejorar los diseños responsive y la navegación móvil
- Añadir páginas de perfiles de equipos y competiciones
- Ampliar la cobertura de clasificaciones, alineaciones y estadísticas
- Añadir estados de carga, vacío y error para datos de producción
- Mejorar la accesibilidad y la navegación con teclado
- Añadir pruebas automatizadas para los flujos principales de usuario
