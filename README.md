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

3. Optional: configure a real fixtures provider. MatchDay reads `FOOTBALL_API_KEY` on the server for API-Football fixtures and falls back to demo data when it is omitted or unavailable. Do not prefix this variable with `NEXT_PUBLIC_` or commit real keys.

   ```bash
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

### Deployment

MatchDay is intended to be deployed on Vercel. After connecting the GitHub repository to Vercel, deployments can be triggered automatically from the selected production branch.

Current live deployment:

```text
https://matchday-beige-three.vercel.app
```

### Current status

MatchDay is currently a portfolio project with demo/mock data as its safe fallback. If `FOOTBALL_API_KEY` is configured in the server environment, the fixtures list first tries to load live API-Football data before falling back to the demo data.

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

3. Opcional: configura un proveedor real de calendarios. MatchDay lee `FOOTBALL_API_KEY` en el servidor para obtener partidos de API-Football y vuelve a los datos demo cuando falta la variable o el proveedor no está disponible. No uses el prefijo `NEXT_PUBLIC_` ni subas claves reales al repositorio.

   ```bash
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

### Despliegue

MatchDay está pensado para desplegarse en Vercel. Después de conectar el repositorio de GitHub con Vercel, los despliegues pueden ejecutarse automáticamente desde la rama de producción seleccionada.

Despliegue actual en vivo:

```text
https://matchday-beige-three.vercel.app
```

### Estado actual

MatchDay es actualmente un proyecto de portafolio con datos demo/mock como respaldo seguro. Si `FOOTBALL_API_KEY` está configurada en el entorno del servidor, la lista de partidos primero intenta cargar datos reales de API-Football antes de volver a los datos demo.

### Roadmap

- Ampliar la integración de la API de datos de fútbol más allá de los calendarios
- Añadir vistas de detalle de partido más completas
- Mejorar los diseños responsive y la navegación móvil
- Añadir páginas de perfiles de equipos y competiciones
- Ampliar la cobertura de clasificaciones, alineaciones y estadísticas
- Añadir estados de carga, vacío y error para datos de producción
- Mejorar la accesibilidad y la navegación con teclado
- Añadir pruebas automatizadas para los flujos principales de usuario
