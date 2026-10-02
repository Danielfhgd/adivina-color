# Adivina el Color (Color Quest) - Agent Instructions

## Project Overview
React + Vite game "Color Quest" - a color precision matching game with P2P multiplayer via PeerJS.

## Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | Production build (Vite) |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview production build |

## Architecture
- **Single-page React app** (`src/App.jsx` - ~600 lines, main game logic)
- **P2P Multiplayer** via PeerJS (`src/utils/multiplayer.js`)
- **5 screens**: Start → Lobby → Game → ResultModal → Summary
- **Character Editor** for creating custom characters
- **HSL color space** for color matching logic (`src/utils/color.js`)

## Key Files
| File | Purpose |
|------|---------|
| `src/App.jsx` | Main game state, screens, multiplayer logic, heartbeat |
| `src/utils/color.js` | `calculateAccuracy()` - HSL distance with exponent 2.2 |
| `src/utils/multiplayer.js` | PeerJS wrapper: connect, listen, broadcast, ping/pong |
| `src/components/*` | 13 UI components (screens, controls, modals) |
| `src/utils/colorConversion.js` | HSL/RGB/HEX conversions |
| `src/data/challenges.js` | Character challenges (base + mask images) |

## Multiplayer Flow
1. **Host** creates room → gets PeerJS ID → shares code
2. **Guest** enters code → connects to Host via PeerJS
3. **Host starts** → both receive challenge → sync timer
4. **Heartbeat**: Host sends PING every 5-8s → Guest replies PONG
5. **Disconnect**: `beforeunload` + `connection.on("close")` + heartbeat timeout → `PLAYER_DISCONNECTED` message

## Critical Implementation Details
- **Color accuracy**: Euclidean weighted distance (Hue 50%, Sat 25%, Light 25%) + `Math.pow(1-error, 2.2)`
- **No character repeats**: `getRandomChallenge(currentId, usedIds[])` tracks used IDs
- **Heartbeat**: Host pings 5-8s, Guest auto-replies PONG, Host detects missing PONG → alert + cleanup
- **State**: `useRef` for timers, connections, host state; `useState` for UI
- **Character images**: Base + mask (CSS `mask-image`) for recoloring

## Linting
- **Tool**: oxlint (fast, Rust-based)
- **Config**: `.oxlintrc.json` - React hooks rules only
- **Run**: `npm run lint`

## Vite Config
- `@vitejs/plugin-react` (Oxc-based)
- No TypeScript, no React Compiler
- `type: "module"` in package.json

## Gotchas
- Babel syntax errors if optional chaining (`?.`) used in certain contexts - use explicit checks
- `targetColor` useMemo depends on `challenge` which can be null initially
- `roundResults` stores `characterId` for anti-repeat logic
- `hostStateRef` holds multiplayer state (players, usedChallengeIds, submittedColors)
- Guest has `connectToHost(..., onClose)` callback for connection loss
- `broadcastMessage` sends to all active connections