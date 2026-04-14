# El Genio Mundialista

Aplicación web de trivia futbolística temática de la Copa del Mundo. Los jugadores responden preguntas de verdadero/falso sobre la historia del fútbol mundial, compiten por posiciones en un ranking global y pueden personalizar la experiencia mediante diseños intercambiables.

---

## Tabla de contenidos

1. [Descripción General](#descripción-general)
2. [Tech Stack](#tech-stack)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Arquitectura de la Aplicación](#arquitectura-de-la-aplicación)
5. [Tipos y Modelos de Datos](#tipos-y-modelos-de-datos)
6. [Módulos Raíz](#módulos-raíz)
   - [index.tsx](#indextsx)
   - [types.ts](#typests)
   - [constants.ts](#constantsts)
   - [audio.ts](#audiots)
   - [firebase.ts](#firebasets)
   - [vite.config.ts](#viteconfigts)
7. [Base de Datos Local (src/db.ts)](#base-de-datos-local-srcdbts)
8. [App Principal (src/App.tsx)](#app-principal-srcapptsx)
9. [Componentes](#componentes)
   - [Home.tsx](#hometsx)
   - [Auth.tsx](#authtsx)
   - [DifficultySelector.tsx](#difficultyselectortsx)
   - [Gameplay.tsx](#gameplaytsx)
   - [Feedback.tsx](#feedbacktsx)
   - [Summary.tsx](#summarytsx)
   - [Ranking.tsx](#rankingtsx)
   - [Profile.tsx](#profiletsx)
   - [LeadCapture.tsx](#leadcapturetsx)
   - [LoadingScreen.tsx](#loadingscreentsx)
   - [adminDesignStore.ts](#admindesignstorets)
   - [Codigo.tsx](#codigotsx)
   - [Disenio.tsx](#diseniotsx)
   - [menuControl.tsx](#menucontroltsx)
10. [Panel de Administración](#panel-de-administración)
11. [Sistema de Diseño Dinámico](#sistema-de-diseño-dinámico)
12. [Progressive Web App (PWA)](#progressive-web-app-pwa)
13. [Despliegue con Docker](#despliegue-con-docker)
14. [Variables de Entorno](#variables-de-entorno)
15. [Comandos de Desarrollo](#comandos-de-desarrollo)

---

## Descripción General

*El Genio Mundialista* es una Single Page Application (SPA) construida con React y TypeScript. El flujo principal del juego es:

1. El jugador abre la app y se registra (o inicia sesión con datos guardados).
2. Selecciona un nivel de dificultad.
3. Responde preguntas de verdadero/falso con un temporizador.
4. Recibe retroalimentación inmediata después de cada pregunta.
5. Al finalizar ve un resumen con estadísticas y puede sincronizar su puntuación.
6. Puede consultar el ranking global de jugadores.

La app es **Offline-First**: usa IndexedDB (vía Dexie.js) para almacenar preguntas, usuarios y rondas localmente, sincronizando con la API REST cuando hay conexión.

---

## Tech Stack

| Tecnología | Versión | Función |
|---|---|---|
| **React** | `^19.2.4` | Librería de UI |
| **TypeScript** | `~5.8.2` | Tipado estático |
| **Vite** | `^6.2.0` | Bundler y servidor de desarrollo |
| **vite-plugin-pwa** | — | Generación de Service Worker y manifest PWA |
| **Tailwind CSS** | — | Estilos utilitarios (clases en JSX) |
| **Dexie.js** | — | ORM para IndexedDB (almacenamiento offline) |
| **Firebase SDK** | `10.8.0` | Firestore para ranking global en la nube |
| **html-to-image** | — | Exportar tarjeta de resultados como PNG |
| **Nginx** | `stable-alpine` | Servidor HTTP en producción (Docker) |
| **Node.js** | `20-alpine` | Imagen base para la etapa de build en Docker |

---

## Estructura del Proyecto

```
Genio_Frontend/
├── Dockerfile                  # Build multi-stage: Node (build) + Nginx (prod)
├── nginx.conf                  # Configuración Nginx para SPA (react-router fallback)
├── vite.config.ts              # Configuración Vite + PWA + aliases
├── tsconfig.json               # Configuración TypeScript
├── index.html                  # Punto de entrada HTML
├── index.tsx                   # Punto de entrada React (monta <App />)
├── package.json                # Dependencias y scripts npm
│
├── types.ts                    # Tipos e interfaces globales
├── constants.ts                # Base de datos de preguntas y configuración de dificultades
├── audio.ts                    # Gestión de efectos de sonido y música de fondo
├── firebase.ts                 # Configuración Firebase y funciones de ranking en la nube
│
├── public/
│   ├── manifest.json           # Manifest de la PWA
│   ├── sw.js                   # Service Worker (caché shell + imágenes)
│   └── images/                 # Assets estáticos (fondos, íconos, logos)
│
└── src/
    ├── App.tsx                 # Componente raíz — máquina de estados de pantallas
    ├── db.ts                   # Definición de la base de datos Dexie (IndexedDB)
    └── components/
        ├── adminDesignStore.ts # Store de configuraciones de diseño (localStorage + API)
        ├── Auth.tsx            # Registro / inicio de sesión de jugador
        ├── Codigo.tsx          # Panel admin: aplicar código de diseño
        ├── DifficultySelector.tsx  # Selección de nivel de dificultad
        ├── Disenio.tsx         # Panel admin: crear/editar diseños
        ├── Feedback.tsx        # Pantalla de retroalimentación post-pregunta
        ├── Gameplay.tsx        # Pantalla de juego activo (pregunta + temporizador + swipe)
        ├── Home.tsx            # Pantalla principal / bienvenida
        ├── LeadCapture.tsx     # Captura de datos de usuario anónimo post-juego
        ├── LoadingScreen.tsx   # Overlay de carga animado
        ├── menuControl.tsx     # Panel admin: sincronización completa de diseños
        ├── Profile.tsx         # Perfil de jugador (edición, emblema, logout)
        ├── Ranking.tsx         # Tabla de posiciones global Top 20
        └── Summary.tsx         # Resumen final con estadísticas de la partida
```

---

## Arquitectura de la Aplicación

### Navegación por máquina de estados

La app **no usa React Router**. La navegación se gestiona mediante el campo `currentScreen` del estado global en `App.tsx`, que puede tomar los siguientes valores:

```
HOME → DIFFICULTY → GAMEPLAY → FEEDBACK (loop) → SUMMARY
                                                    ↓
                                               LEAD_CAPTURE
HOME ← AUTH (registro)
     ← PROFILE
     ← RANKING
[Admin] → CODIGO → DISENIO → MENU_CONTROL
```

`App.tsx` actúa como un **router condicional**: según `currentScreen` renderiza el componente correspondiente y le pasa los handlers de navegación como props.

### Flujo de datos

```
API REST (VITE_API_URL)
        ↕
  adminDesignStore.ts  ←→  localStorage
        ↕
    App.tsx (estado global)
        ↕
  IndexedDB / Dexie (src/db.ts)
        ↕
    Componentes (props)
```

---

## Tipos y Modelos de Datos

**Archivo:** `types.ts`

### `Difficulty`

```typescript
type Difficulty = 'Banca' | 'Amateur' | 'PRO' | 'Leyenda';
```

Los cuatro niveles de dificultad disponibles. Determinan el tiempo por pregunta y la progresión de penalización.

### `Question`

```typescript
interface Question {
  id: number;
  pregunta: string;       // Enunciado de la pregunta
  respuesta: boolean;     // Respuesta correcta (true = Verdadero)
  explicacion: string;    // Explicación que se muestra en Feedback
  categoria: number;      // Siempre 1 para preguntas de diseño personalizado
}
```

### `User`

```typescript
interface User {
  name: string;
  email: string;
  description?: string;
  avatarColor?: string;
  avatarIcon?: string;
  identificador?: string;
  emblema?: string;         // Ícono Material Symbols seleccionado
  id_usuarios?: number;     // ID del backend
}
```

### `GameState`

```typescript
interface GameState {
  currentScreen: /* union de pantallas */;
  difficulty: Difficulty | null;
  currentQuestionIndex: number;
  questions: Question[];
  score: number;
  streak: number;
  lastAnswerCorrect: boolean | null;
  startTime: number;        // Timestamp de inicio de partida
  endTime: number | null;   // Timestamp de fin de partida
  user?: User | null;
}
```

`App.tsx` extiende este tipo con `ExtendedGameState` agregando:
- `answersHistory: boolean[]` — historial de respuestas para estadísticas
- `pointsPerQuestion: number` — puntos base por respuesta correcta
- `timeLimit: number` — límite de tiempo configurable

---

## Módulos Raíz

### `index.tsx`

Punto de entrada de la aplicación. Monta el componente `<App />` dentro de `React.StrictMode` en el elemento `#root` del DOM.

---

### `types.ts`

Define todos los tipos e interfaces TypeScript compartidos a lo largo de la aplicación. Actúa como contrato de datos entre componentes, servicios y la API.

---

### `constants.ts`

Contiene dos exportaciones:

#### `QUESTIONS_DATABASE`

Base de datos estática de preguntas de trivia futbolística. Contiene preguntas organizadas por dificultad:

| Dificultad | Rango de IDs | Descripción |
|---|---|---|
| **Banca** | 1–20 | Preguntas básicas del Mundial |
| **Amateur** | 41–50 | Conocimiento intermedio |
| **PRO** | 56–68 | Datos avanzados e históricos |
| **Leyenda** | 71–80 | Curiosidades y hechos rarísimos |

> **Nota:** Esta base de datos se usa como **fallback** cuando no hay preguntas del diseño activo ni conexión a la API.

#### `DIFFICULTY_CONFIG`

Array de objetos que define la presentación visual de cada nivel:

```typescript
{
  id: 'Banca' | 'Amateur' | 'PRO' | 'Leyenda',
  label: string,    // Nombre mostrado
  desc: string,     // Descripción motivacional
  color: string,    // Color hex del nivel
  icon: string      // Nombre del ícono Material Symbols
}
```

---

### `audio.ts`

Gestiona todos los efectos de sonido y la música de fondo mediante la clase `AudioManager`.

#### Sonidos disponibles

| Clave | Descripción |
|---|---|
| `click` | Clic de botón |
| `correct` | Respuesta correcta |
| `incorrect` | Respuesta incorrecta |
| `tick` | Tick del temporizador |
| `whistle` | Silbato de inicio |
| `bgMusic` | Música de fondo en loop |

#### API pública

```typescript
audioManager.play('click')           // Reproducir efecto de sonido
audioManager.startBackgroundMusic()  // Iniciar música (loop, volumen 0.15)
audioManager.stopBackgroundMusic()   // Detener música
audioManager.toggleMusic()           // Alternar música; retorna estado actual
```

- Los sonidos se almacenan en caché (`audioCache`) para reproducción instantánea.
- El volumen de los efectos se fija en `0.5`.
- Los errores de autoplay del navegador se manejan silenciosamente con `console.debug`.

---

### `firebase.ts`

Integración con **Firebase Firestore** para el ranking global en la nube.

> **⚠️ Configuración requerida:** Reemplazar los valores del objeto `firebaseConfig` con los del proyecto Firebase real antes de desplegar.

#### `saveScoreToCloud(user, score)`

Guarda la puntuación de un jugador en la colección `rankings` de Firestore con los campos:
`userName`, `email`, `score`, `avatarIcon`, `avatarColor`, `timestamp`, `platform`.

#### `getGlobalRankings()`

Obtiene el Top 10 de jugadores ordenados por puntuación descendente.

---

### `vite.config.ts`

Configura Vite con:
- **Puerto de desarrollo:** `3000` (accesible en red con `host: '0.0.0.0'`)
- **Plugin React:** `@vitejs/plugin-react`
- **Plugin PWA:** `vite-plugin-pwa` con `registerType: 'autoUpdate'`, caché de assets estáticos y `navigateFallback: '/index.html'`
- **Variables de entorno expuestas:** `API_KEY`, `GEMINI_API_KEY`, `VITE_API_URL`
- **Alias de ruta:** `@` apunta a la raíz del proyecto

---

## Base de Datos Local (`src/db.ts`)

Define la base de datos **IndexedDB** usando Dexie.js. La clase `GenioDatabase` extiende `Dexie` y versiona el esquema.

### Tablas

| Tabla | Clave primaria | Descripción |
|---|---|---|
| `tbl_categoria` | `++id_categoria` | Categorías de preguntas |
| `tbl_diseno` | `code` | Configuraciones de diseño personalizadas (por código) |
| `tbl_preguntas_disenos` | `++pregunta_id` | Preguntas asociadas a un diseño específico |
| `tbl_preguntas` | `id_pregunta` | Preguntas generales del backend |
| `tbl_pregunta_ronda` | `pregunta` | Estado de cada pregunta dentro de una ronda |
| `tbl_rondas` | `++id_ronda` | Historial de partidas jugadas |
| `tbl_usuario` | `++id_usuario` | Datos del jugador (offline-first) |

La instancia se exporta como `db` y es importada por `App.tsx` y `Auth.tsx`.

---

## App Principal (`src/App.tsx`)

El componente de más alto nivel. Gestiona el estado global de la partida y orquesta toda la navegación.

### Estado principal (`ExtendedGameState`)

```typescript
{
  currentScreen: 'HOME',      // Pantalla inicial
  difficulty: null,
  currentQuestionIndex: 0,
  questions: [],
  score: 0,
  streak: 0,
  lastAnswerCorrect: null,
  startTime: 0,
  endTime: null,
  answersHistory: [],
  user: null,
  pointsPerQuestion: 150,
  timeLimit: 15,
}
```

### Funciones clave

#### `startGame(overrideUserId?)`
Inicia una nueva partida:
1. Verifica que el usuario esté autenticado (si no, redirige a `AUTH`).
2. Intenta obtener preguntas del diseño activo desde la API o caché local.
3. Si no hay preguntas del diseño, usa `QUESTIONS_DATABASE` como fallback.
4. Filtra preguntas ya jugadas en la sesión actual.
5. Aplica un límite de preguntas según la dificultad elegida.
6. Transiciona a la pantalla `DIFFICULTY`.

#### `handleAnswer(isCorrect)`
Procesa una respuesta:
- Actualiza `score`, `streak`, `answersHistory` y `lastAnswerCorrect`.
- Si `isCorrect`, suma `pointsPerQuestion` al puntaje.
- Si no hay más preguntas, finaliza la partida (`endTime`) y va a `SUMMARY`.
- Si quedan preguntas, avanza el índice y va a `FEEDBACK`.

#### `hexToRgbString(hex)`
Convierte un color hexadecimal a string `"R, G, B"` para usarlo en variables CSS con transparencia (`rgba(var(--color), 0.5)`).

#### `refreshUserData()`
Re-fetch del usuario actual desde la API para mantener datos sincronizados al volver a `HOME`.

### Variables CSS de diseño dinámico

`App.tsx` inyecta en el `<div>` raíz variables CSS que todos los componentes hijos consumen:

```css
--design-background-image: url('...');
--design-background-color: #...;
--design-logo-image: url('...');
--color-primary: R, G, B;
```

### Panel de administración (acceso secreto)

El panel admin se desbloquea con **5 toques consecutivos** en el logo. Al desbloquearse, `adminUnlocked` se pone en `true` y aparecen las pantallas `CODIGO`, `DISENIO` y `MENU_CONTROL`. El PIN de administrador se lee desde `VITE_ADMIN_PIN` (default: `2026GENIO`).

---

## Componentes

### `Home.tsx`

**Pantalla:** `HOME`

Pantalla de bienvenida y punto de entrada al juego.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `user` | `User \| null` | Usuario autenticado (opcional) |
| `onStart` | `() => void` | Callback para iniciar el juego (usuario registrado) |
| `onLogin` | `() => void` | Navegar a pantalla de autenticación |
| `onProfile` | `() => void` | Navegar al perfil del usuario |
| `onRegisterAndStart` | `async (data) => void` | Registro rápido desde modal e inicio de juego |
| `isSyncing` | `boolean` | Indica sincronización en curso (muestra spinner) |
| `logoImage` | `string` | URL del logo activo (del diseño) |
| `appTitle` | `string` | Título de la app (configurable por diseño) |
| `appSubtitle` | `string` | Subtítulo (configurable por diseño) |
| `appTagline` | `string` | Eslogan (configurable por diseño) |

**Comportamiento:**
- Si el usuario NO está autenticado, el botón "Jugar" abre un **modal de registro rápido** que valida nombre, email y teléfono (formato Honduras `+504XXXXXXXX`).
- Si el usuario SÍ está autenticado, "Jugar" llama directamente a `onStart`.
- El botón de perfil en la esquina superior derecha muestra el emblema del usuario o un ícono de persona.

---

### `Auth.tsx`

**Pantalla:** `AUTH`

Formulario de registro de nuevo jugador ("Nuevo Fichaje").

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `onSuccess` | `(user: User) => void` | Callback con el usuario creado |
| `onBack` | `() => void` | Volver a la pantalla anterior |

**Flujo:**
1. Envía `POST` a `{VITE_API_URL}usuarios/acceso_directo/` con `identificador`, `email`, `telefono` y `recibir_apostemos`.
2. Guarda el usuario en `tbl_usuario` de Dexie (offline-first).
3. Persiste en `localStorage` bajo la clave `mundialista_user`.
4. Llama a `onSuccess` con el objeto de usuario listo para el estado de la app.

---

### `DifficultySelector.tsx`

**Pantalla:** `DIFFICULTY`

Permite al jugador elegir el nivel de dificultad antes de iniciar la partida.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `onSelect` | `(difficulty: Difficulty) => void` | Nivel seleccionado |
| `onBack` | `() => void` | Volver a `HOME` |
| `onRanking` | `() => void` | Navegar al ranking |
| `onProfile` | `() => void` | Navegar al perfil |

Renderiza los 4 niveles de `DIFFICULTY_CONFIG` como botones con color e ícono únicos. La barra de navegación inferior permite acceso rápido a Home, Ranking y Perfil.

---

### `Gameplay.tsx`

**Pantalla:** `GAMEPLAY`

El núcleo del juego. Muestra la pregunta activa y gestiona la interacción del jugador.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `question` | `Question` | Pregunta actual |
| `index` | `number` | Número de pregunta (0-indexed) |
| `total` | `number` | Total de preguntas en la ronda |
| `streak` | `number` | Racha actual de aciertos |
| `difficulty` | `Difficulty` | Nivel de dificultad activo |
| `onAnswer` | `(isCorrect: boolean) => void` | Callback con resultado de la respuesta |
| `onHome` | `() => void` | Salir al inicio |
| `timeLimit` | `number` | Tiempo base en segundos |
| `logoImage` | `string` | Logo del diseño activo |
| `iconVImage` | `string` | Ícono personalizado "Verdadero" |
| `iconFImage` | `string` | Ícono personalizado "Falso" |

**Mecánicas:**

- **Temporizador dinámico:** El tiempo base varía por dificultad (Banca: 15s → Leyenda: 10s) y se reduce progresivamente conforme avanza el índice de pregunta (`-0.4s/pregunta`) y la racha (`-0.5s` cada 3 aciertos). Mínimo absoluto: 4 segundos.
- **Respuesta por botón:** Botones "Verdadero" y "Falso".
- **Respuesta por swipe:** El jugador puede arrastrar la tarjeta de pregunta horizontalmente (`SWIPE_THRESHOLD = 150px`). Swipe derecha = Verdadero, Swipe izquierda = Falso.
- **Tiempo agotado:** Si el contador llega a 0, se registra automáticamente como respuesta incorrecta.
- **Modo urgente:** Cuando quedan ≤ 3 segundos, la UI entra en modo visual de alerta (`isUrgent`).

---

### `Feedback.tsx`

**Pantalla:** `FEEDBACK`

Pantalla de retroalimentación que se muestra después de cada respuesta.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `isCorrect` | `boolean` | Si la respuesta fue correcta |
| `question` | `Question` | La pregunta respondida |
| `onNext` | `() => void` | Continuar a la siguiente pregunta |
| `pointsEarned` | `number` | Puntos obtenidos en este turno |
| `iconVictoriaImage` | `string` | Imagen personalizada de "victoria" |
| `iconFallasteImage` | `string` | Imagen personalizada de "fallaste" |

**Displayables:**
- Resultado: `¡GOLAZO!` (correcto) o `OFFSIDE` (incorrecto).
- La respuesta correcta en texto: `VERDADERO` o `FALSO`.
- La explicación de la pregunta (`question.explicacion`).
- Los puntos ganados en el turno.
- Fondo verde oscuro (`#102210`) si es correcto, rojo oscuro (`#221010`) si es incorrecto.

---

### `Summary.tsx`

**Pantalla:** `SUMMARY`

Resumen final de la partida con estadísticas completas.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `state` | `ExtendedGameState` | Estado completo de la partida |
| `onRestart` | `() => void` | Jugar de nuevo |
| `onRegister` | `() => void` | Navegar a registro (si no hay usuario) |
| `onRanking` | `() => void` | Ver el ranking global |
| `onHome` | `() => void` | Volver al inicio |

**Estadísticas mostradas:**
- Puntaje final
- Respuestas correctas ("Goles")
- Tiempo total de la partida (`MM:SS`)
- Precisión porcentual

**Acciones adicionales:**
- **Sincronizar puntuación:** Llama a `saveScoreToCloud` para guardar en Firebase Firestore.
- **Exportar tarjeta:** Usa `html-to-image` para generar un PNG compartible de la tarjeta de resultados.

---

### `Ranking.tsx`

**Pantalla:** `RANKING`

Tabla del Top 20 de jugadores globales.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `userScore` | `number` | Puntaje del usuario actual |
| `userName` | `string` | Nombre del usuario actual |
| `userIcon` | `string` | Ícono de avatar del usuario |
| `userColor` | `string` | Color de avatar del usuario |
| `userId` | `number \| null` | ID del usuario para obtener su posición exacta |
| `onBack` | `() => void` | Volver atrás |
| `onProfile` | `() => void` | Ir al perfil |
| `onLogout` | `() => void` | Cerrar sesión |

**Funcionamiento:**
- Al montar, hace `GET` a `{VITE_API_URL}usuarios/ranking/?user_id={userId}`.
- La API devuelve `{ top_20: PlayerRank[], user_rank: number }`.
- El jugador actual se resalta visualmente en la lista.
- Mientras carga muestra un spinner con el texto "Consultando VAR...".

---

### `Profile.tsx`

**Pantalla:** `PROFILE`

Perfil del jugador. Permite editar datos y personalizar el avatar.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `user` | `any` | Datos del usuario (mapeados de `tbl_usuario`) |
| `onUpdate` | `async (data) => void` | Persistir cambios del perfil |
| `onLogout` | `() => void` | Cerrar sesión y limpiar estado |
| `onDelete` | `() => void` | Desactivar la cuenta del jugador |
| `onBack` | `() => void` | Volver atrás |

**Funcionalidades:**
- Editar **teléfono** y preferencia de **recibir comunicaciones** (`apostemos`).
- Seleccionar **emblema** (avatar) entre 4 opciones: Balón, Corona, Estrella, Rayo — cada uno con su color distintivo.
- Durante actualizaciones muestra un overlay de carga sobre el avatar.
- `onUpdate` envía un `PATCH` a la API y actualiza `localStorage`.

---

### `LeadCapture.tsx`

**Pantalla:** `LEAD_CAPTURE`

Pantalla de captura de datos para jugadores anónimos que desean guardar su puntuación tras terminar una partida.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `score` | `number` | Puntaje obtenido |
| `onComplete` | `() => void` | Navegar al ranking tras registrarse |
| `onCancel` | `() => void` | Saltar el registro |

**Flujo:**
1. Recoge nombre y email.
2. Crea un objeto `User` temporal.
3. Lo persiste en `localStorage`.
4. Intenta guardar la puntuación en Firebase (`saveScoreToCloud`).
5. Muestra confirmación "¡Fichaje Completado!" e invita a ver el ranking.

---

### `LoadingScreen.tsx`

Overlay de pantalla completa que aparece durante la carga de preguntas desde la API.

- Posición `fixed` con `z-index: 200`, cubre toda la pantalla.
- Muestra un balón de fútbol animado con efecto `bounce` y `ping`.
- Texto: "ALISTANDO CANCHA" con subtítulo "Trayendo preguntas desde el VAR...".
- Se activa/desactiva mediante el estado `isLoading` en `App.tsx`.

---

### `adminDesignStore.ts`

**Módulo de servicio** para gestión completa de diseños personalizados. No es un componente React; es una capa de lógica de negocio que combina `localStorage`, `IndexedDB` y la API REST.

#### Interfaces principales

##### `DesignConfig`

```typescript
interface DesignConfig {
  code: string;                 // Código único del diseño (ej: "AB12CD")
  name: string;
  primaryColor: string;         // Color hex principal
  backgroundImage: string;      // URL o base64 del fondo
  logoImage?: string;           // URL o base64 del logo
  fontFamily: string;
  questions: Question[];        // Preguntas asociadas
  createdAt: number;
  updatedAt: number;
  expiryDate?: number;          // Timestamp de expiración
  appTitle?: string;
  appSubtitle?: string;
  appTagline?: string;
  iconVictoriaImage?: string;   // Ícono personalizado victoria
  iconFallasteImage?: string;   // Ícono personalizado fallaste
  iconVImage?: string;          // Botón verdadero personalizado
  iconFImage?: string;          // Botón falso personalizado
}
```

##### `DesignSyncPayload`

Estructura para sincronización pendiente con la API (cola offline).

#### Funciones exportadas

| Función | Descripción |
|---|---|
| `getActiveDesignCode()` | Retorna el código de diseño activo desde `localStorage` |
| `setActiveDesignCode(code)` | Persiste el código activo |
| `clearActiveDesignCode()` | Limpia el código activo (vuelve al diseño por defecto) |
| `getActiveDesignConfig()` | Retorna la `DesignConfig` del diseño activo |
| `getDesignByCode(code)` | Busca un diseño por código en localStorage |
| `getAllDesignConfigs()` | Lista todos los diseños almacenados |
| `saveDesignConfig(config)` | Crea o actualiza un diseño (genera código si es nuevo) |
| `deleteDesignByCode(code)` | Elimina un diseño localmente |
| `getQuestionsByCode(code)` | Obtiene las preguntas de un diseño desde localStorage |
| `updateQuestionsByCode(code, questions)` | Actualiza preguntas de un diseño |
| `getQuestionsByCodeOffline(code)` | Lee preguntas desde IndexedDB (offline) |
| `syncDesignByCodeToApi(code)` | Sincroniza un diseño completo con la API |
| `fetchQuestionsByCodeFromApi(code)` | Descarga preguntas desde la API |
| `insertQuestionsByCodeInApi(code, questions)` | Inserta preguntas vía API |
| `replaceQuestionsByCodeInApi(code, questions)` | Reemplaza preguntas vía API |
| `deleteDesignByCodeInApi(code)` | Elimina un diseño en la API |
| `updateAssetsByCode(code, assets)` | Actualiza imágenes (fondo/logo) del diseño en la API |
| `setExpiryDateByCode(code, ts)` | Actualiza la fecha de expiración |
| `isDesignExpired(design)` | Verifica si un diseño ha expirado |
| `formatDateForInput(ts?)` | Formatea timestamp a `YYYY-MM-DD` para `<input type="date">` |
| `parseDateToTimestamp(str)` | Convierte `YYYY-MM-DD` a timestamp Unix |

**Gestión de expiración:** Los diseños almacenados se limpian automáticamente si su `expiryDate` es anterior a la fecha actual. Esto ocurre en cada llamada a `readAll()`.

**Cola de sincronización pendiente:** Usa la clave `genio_design_db_sync_pending` en localStorage para encolar cambios que no se pudieron enviar a la API por falta de conexión.

---

### `Codigo.tsx`

**Pantalla:** `CODIGO` (Admin)

Panel de administración para aplicar un código de diseño activo.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `onBack` | `() => void` | Volver atrás |
| `onGoToDisenio` | `() => void` | Ir al panel de diseños |
| `onGoToMenuControl` | `() => void` | Ir al menú de control |
| `currentCode` | `string` | Código activo actualmente |
| `onApplyCode` | `(code: string) => { ok, message }` | Callback para aplicar el código |

Permite ingresar un código, aplicarlo globalmente o limpiar el código para usar el diseño por defecto. El input fuerza mayúsculas automáticamente (`toUpperCase()`).

---

### `Disenio.tsx`

**Pantalla:** `DISENIO` (Admin)

Panel para crear, editar y eliminar configuraciones de diseño localmente.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `onBack` | `() => void` | Volver atrás |
| `onGoToCodigo` | `() => void` | Ir a Codigo |
| `onGoToMenuControl` | `() => void` | Ir a MenuControl |

**Funcionalidades:**
- Crear un nuevo diseño con nombre, color primario, imagen de fondo, fuente y fecha de expiración.
- Editar un diseño existente seleccionándolo de la lista.
- Eliminar un diseño con confirmación (`window.confirm`).
- El código se genera automáticamente al guardar si no se especifica uno.
- Los diseños guardados aquí persisten en `localStorage` y pueden sincronizarse con la API desde `menuControl.tsx`.

---

### `menuControl.tsx`

**Pantalla:** `MENU_CONTROL` (Admin)

Panel de control completo para administración avanzada de diseños. Es el hub central de la administración.

**Props:**
| Prop | Tipo | Descripción |
|---|---|---|
| `onBack` | `() => void` | Volver atrás |
| `onGoToDisenio` | `() => void` | Ir al panel de diseños |
| `onGoToCodigo` | `() => void` | Ir a aplicar código |
| `onDesignUpdated?` | `() => void` | Callback cuando se actualiza un diseño |

**Capacidades:**
- **Carga de preguntas desde CSV:** Parsea archivos `.csv` (separador `,` o `;`, autodetectado) con columnas `pregunta`, `respuesta`, `explicacion`. Soporta campos con comas dentro de comillas dobles.
- **Carga de assets:** Subir imágenes de fondo y logo (convertidas a base64 o URL) para un diseño.
- **Sincronización con API:** Envía diseño completo (incluyendo preguntas e imágenes) al backend.
- **Vista previa de preguntas:** Muestra las preguntas cargadas antes de sincronizar.
- **Gestión de expiración:** Permite actualizar la fecha de vencimiento de un diseño.
- **Eliminación remota:** Borra el diseño tanto localmente como en la API.

#### Utilidades internas

- **`parseCSV(text)`:** Parser CSV robusto que maneja campos con comas entre comillas. Autodetecta separador (`,` o `;`), normaliza saltos de línea Windows.
- **`readFileAsDataUrl(file)`:** Wrapper de `FileReader` como Promise.
- **`splitCSVRow(row, sep)`:** Tokenizador de filas CSV respetando campos entre comillas.

---

## Panel de Administración

El panel de administración es accesible únicamente mediante un **mecanismo de acceso secreto** en la pantalla `HOME`:

1. Tocar el logo principal **5 veces consecutivamente**.
2. Ingresar el **PIN de administrador** (`VITE_ADMIN_PIN`, por defecto `2026GENIO`).
3. Al validarse, `adminUnlocked` se activa y aparecen las opciones de admin.

### Pantallas del panel

```
CODIGO        → Aplicar/limpiar código de diseño activo
DISENIO       → Crear y editar configuraciones de diseño
MENU_CONTROL  → Sincronización completa con API, carga de CSV y assets
```

> **Seguridad:** Si `adminUnlocked` es `false` y el `currentScreen` es una pantalla de admin, `App.tsx` redirige automáticamente a `HOME`.

---

## Sistema de Diseño Dinámico

La app soporta **temas visuales intercambiables** identificados por un código único (ej: `AB12CD`).

### Qué puede personalizar un diseño

| Campo | Descripción |
|---|---|
| `primaryColor` | Color principal de la interfaz |
| `backgroundImage` | Imagen de fondo de todas las pantallas |
| `logoImage` | Logo en el header |
| `fontFamily` | Fuente tipográfica global |
| `questions` | Conjunto de preguntas propio del diseño |
| `appTitle` | Nombre de la aplicación |
| `appSubtitle` | Subtítulo |
| `appTagline` | Eslogan |
| `iconVictoriaImage` | Imagen mostrada al acertar |
| `iconFallasteImage` | Imagen mostrada al fallar |
| `iconVImage` | Ícono del botón "Verdadero" |
| `iconFImage` | Ícono del botón "Falso" |
| `expiryDate` | Fecha de expiración del diseño |

### Flujo de aplicación del diseño

1. El admin ingresa el código en `Codigo.tsx`.
2. `setActiveDesignCode(code)` lo persiste en `localStorage`.
3. `App.tsx` inyecta las propiedades del diseño como variables CSS y props en todos los componentes hijos.
4. Los componentes usan `var(--design-background-image)` o las props para renderizar los assets correctos.

---

## Progressive Web App (PWA)

La aplicación está configurada como PWA con soporte offline.

### Service Worker (`public/sw.js`)

Implementa una estrategia de caché en dos capas:

| Caché | Contenido | Estrategia |
|---|---|---|
| `genio-shell-v1-1` | `index.html`, `/`, `manifest.json` | Pre-caché en instalación |
| `genio-images-v1-1` | Imágenes del juego | Caché on-demand |

**Estrategias de fetch:**
- Las peticiones `POST` se ignoran (las maneja la app con cola offline).
- Las rutas `/api/` se ignoran (deben ir a la red).
- Los recursos del shell se sirven desde caché con fallback a red.
- Las imágenes se sirven desde caché con fallback a red y se almacenan para uso futuro.

### Manifest (`public/manifest.json`)

Define la instalación como app nativa con íconos para 192×192 y 512×512 px.

---

## Despliegue con Docker

El `Dockerfile` utiliza un **build multi-stage** para optimizar la imagen final:

### Stage 1: Build (`node:20-alpine`)

```dockerfile
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

- Acepta `VITE_API_URL` como argumento de build (`--build-arg`) para embeber la URL de la API en el bundle estático.
- Ejecuta `npm install` y `npm run build` generando los archivos en `/app/dist`.

### Stage 2: Producción (`nginx:stable-alpine`)

- Copia el directorio `dist` a `/usr/share/nginx/html`.
- Copia `nginx.conf` como configuración del servidor.
- Expone el puerto `80`.

### Configuración Nginx (`nginx.conf`)

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

La directiva `try_files` es **crítica** para el funcionamiento de la SPA: redirige todas las rutas no encontradas a `index.html`, permitiendo que React maneje la navegación en el cliente.

### Ejemplo de build

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com/ \
  -t genio-mundialista:latest .

docker run -p 80:80 genio-mundialista:latest
```

---

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL base de la API REST (debe terminar en /)
VITE_API_URL=https://api.tudominio.com/

# PIN de acceso al panel de administración
VITE_ADMIN_PIN=2026GENIO

# (Opcional) API Key de Gemini para funcionalidades de IA
GEMINI_API_KEY=tu_clave_aqui
```

> **⚠️ Importante:** Las variables prefijadas con `VITE_` son embebidas en el bundle durante el build y son visibles en el cliente. No incluyas secretos sensibles en variables `VITE_`.

> **Firebase:** Las credenciales de Firebase **no se leen desde variables de entorno** en la configuración actual. Deben ser reemplazadas directamente en `firebase.ts` antes del despliegue o integrarse mediante variables de entorno adicionales.

---

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:3000)
npm run dev

# Build de producción (genera carpeta /dist)
npm run build

# Preview del build de producción
npm run preview
```
