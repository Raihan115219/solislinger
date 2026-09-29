# Solslinger — Bloody Raven Demo

Single-page interactive 3D proof of concept for client review (Milestone 2). Scope is defined by `Solslinger_Demo_Scope.pdf`.

- 3D Bloody Raven saloon (React Three Fiber), 9:16 portrait, letterboxed on desktop
- Phantom wallet connect / disconnect on Solana **Devnet**, truncated address in the HUD (no transactions)
- Rigged host avatar with idle loop; she turns to look at whichever hotspot is active
- Four hover hotspots (Card Rooms, Slot Machines, Faction War Map, Shoot Your Shot Lounge) with glow + floating label. Hover-only, nothing navigates. On touch screens a tap reveals the hotspot; tapping elsewhere clears it.
- Ambient saloon audio toggle in the HUD (off by default; starts on tap, fades in/out, pauses when the tab is hidden)

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run typecheck && npm run lint
```

Requires Node 18.17+.

`next dev` and `next build` share `.next/`. To build or run a second server while a dev server is running, give it its own folder, e.g. `NEXT_DIST_DIR=.next-qa npx next build`.

## Where things live

| Path | Purpose |
| --- | --- |
| `src/config/scene.ts` | Camera, room and prop layout (metres) |
| `src/config/hotspots.ts` | Hotspot labels, hit boxes, label anchors, host look targets |
| `src/components/scene/` | Canvas, environment, props, host, hotspot system, atmosphere |
| `src/components/wallet/` | Wallet provider, Phantom hook, HUD control |
| `src/components/ui/Overlays.tsx` | HUD, welcome plaque, toast, loader, error panel |
| `public/models/host.glb` | Host avatar (optimised: Idle clip only) |
| `public/audio/saloon-ambience.mp3` | Ambient loop (client-supplied) |
| `src/lib/ambientAudio.ts` | Audio playback, fades, iOS handling |
| `assets/source/` | Original, unmodified source assets |

## Assets and licences

- **Host avatar:** "Animated Woman" by Quaternius, via Poly Pizza, **CC0**. The optimised copy keeps only the Idle clip. The cowboy hat is procedural and added in code.
- **Saloon:** built procedurally in code (primitives + canvas-generated textures). No external model.
- **Ambient audio:** client-supplied (`assets/source/auido.mp3`), served as `public/audio/saloon-ambience.mp3`.
- **Fonts:** Rye and Cinzel (Google Fonts, SIL OFL). `public/fonts/Rye-Regular.ttf` is used for 3D text.

## Not included (by design, per scope)

Room navigation, game logic, credits/economy, smart contracts, token transactions, avatar customiser, factions, onboarding, age gate, Telegram binding.
