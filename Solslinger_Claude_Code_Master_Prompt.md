# Solslinger — Demo Build
## Claude Code Master Implementation Prompt

> Source of truth: `Solslinger_Demo_Scope.pdf`
>
> Goal: build only the amount of functionality required to make a convincing client-review demo. The demo should look polished and attention-grabbing without turning into the full Solslinger product.

---

# 1. PRODUCT UNDERSTANDING

We are building a **single-page interactive 3D demo** for client approval.

The page represents the **Bloody Raven saloon**, which is the future main hub of Solslinger.

This is NOT a multi-page application for this milestone.

Use a single route/page and organize the experience into logical UI/scene sections/components where useful.

The client should be able to open one page and immediately understand:

- the 3D saloon atmosphere;
- the wallet connection concept;
- the host avatar;
- the four future destination hotspots;
- the intended visual quality and interaction style.

The original brief explicitly limits the demo to visual presentation and hover interactions. Hotspots are not navigable in this demo.

---

# 2. PRIMARY GOAL

Create a **small but polished vertical 3D experience** rather than a large unfinished system.

Prioritize:

1. Visual impact
2. Smooth 3D presentation
3. Clear interaction
4. Client-demo polish
5. Mobile 9:16 composition
6. Stable performance
7. Strict scope control

Do NOT implement features simply because they are mentioned as future product functionality.

Only communicate those future areas visually through the saloon hotspots.

---

# 3. SINGLE-PAGE EXPERIENCE

The entire demo should live on one page.

Conceptual layout:

```text
┌──────────────────────────────┐
│      SOLSLINGER HUD          │
│      Wallet status           │
├──────────────────────────────┤
│                              │
│      3D BLOODY RAVEN         │
│           SALOON             │
│                              │
│       [3D HOST AVATAR]       │
│                              │
│   CARD        BOARD          │
│                              │
│         BAR    CABINETS      │
│                              │
├──────────────────────────────┤
│ optional subtle UI / audio   │
└──────────────────────────────┘
```

This is a conceptual composition only. The final 3D camera should determine the actual placement.

Do not create separate pages for:

- Card Rooms
- Slot Machines
- Faction War Map
- Social Lounge

Those are represented only as hover hotspots in this milestone.

---

# 4. SOURCE-BASED SCOPE

The PDF specifies:

### In scope

- 3D saloon scene
- Phantom wallet connect/disconnect
- wallet address shown after connection
- rigged 3D host avatar
- host idle animation
- four hover-animated hotspots
- floating labels
- host reaction to hotspot hover
- 9:16 mobile-first canvas
- optional ambient audio toggle
- western-themed UI shell and fonts

### Not in demo

Do not implement:

- room navigation/page routing
- full card-game logic
- full slot/game logic
- economy/credit systems
- smart contracts
- token transactions
- avatar customization
- faction/passport systems
- onboarding sequence
- oracle integrations
- age-gate functionality
- Telegram binding
- unrelated backend functionality

Keep the implementation tightly aligned with this scope.

---

# 5. VISUAL TARGET

The client should feel:

- “This already looks like a real product.”
- “I can understand the future hub.”
- “The 3D interaction feels alive.”
- “The visual direction is strong.”

We do NOT need a huge amount of functionality.

We need a convincing prototype.

Use:

- cinematic western lighting;
- warm wood materials;
- deep shadows;
- subtle atmospheric depth;
- tasteful highlights;
- clean HUD;
- premium typography;
- smooth hover transitions;
- restrained particles/effects only if performance remains good.

Avoid:

- excessive bloom;
- excessive particles;
- noisy UI;
- too many labels visible simultaneously;
- unnecessary animations;
- visual clutter.

---

# 6. HOST AVATAR

The PDF only requires a rigged 3D host avatar behind the bar.

For this demo, use a **stylized adult female saloon host** if a suitable asset is available.

Important:

- The character should be clearly an adult.
- Do not use a child/minor-looking character.
- Prefer a cute/stylized/cartoon aesthetic rather than photorealism.
- A western/cowgirl-inspired outfit is useful, but avoid adding weapon props.
- The host should feel like a friendly saloon receptionist/host character.
- The character should fit the saloon art direction.

The exact gender/appearance is not mandated by the PDF, so this is a visual implementation choice for the demo.

---

# 7. POSSIBLE AVATAR SOURCES

Before downloading or integrating any external asset, check its license and verify that it permits use in the intended client demo.

Good places to investigate:

### Poly Pizza

Poly Pizza provides low-poly character assets in formats including GLTF/GLB. Its character library includes rigged/animated women and other characters.

Example:

- Animated Woman by Quaternius — GLTF/FBX, CC0:
  https://poly.pizza/m/9kF7eTDbhO

- Generic Female by J-Toastie — GLTF/FBX, Creative Commons Attribution:
  https://poly.pizza/m/qot6C6GS9U

- Poly Pizza people/character library:
  https://poly.pizza/explore/People-and-Characters

### Sketchfab

Sketchfab has many stylized and game-ready characters. Always verify the individual model's license before using it.

Useful examples/search starting points:

- Stylized character category:
  https://sketchfab.com/tags/stylized-character

- Stylized female character example:
  https://sketchfab.com/3d-models/stylized-female-character-a6d52bf2599a41a79d27c890c802f4dc

- A recent game-ready stylized female model may be available, but license/asset terms must be checked individually.

Do not automatically choose an asset just because it is free.

Prefer, in order:

1. Client-provided asset
2. CC0/public-domain asset suitable for the demo
3. Clearly licensed attribution asset
4. Paid commercial asset only if the client/project permits it

If no appropriate asset exists, create the integration using a temporary placeholder and report the missing asset rather than pretending the placeholder is final.

---

# 8. AVATAR TECHNICAL REQUIREMENTS

The character should preferably be:

- GLB/glTF
- rigged
- animated
- reasonably low-poly
- suitable for WebGL
- reasonable texture resolution
- optimized for mobile

Required behavior:

```text
Idle
  ↓
AnimationMixer
  ↓
Continuous subtle animation

Hotspot hovered
  ↓
Look-at target changes
  ↓
Host smoothly turns/looks toward target

No hotspot
  ↓
Host returns toward neutral orientation
```

Do not create a complicated AI character system.

This is just animation + target orientation.

---

# 9. SALOON ASSET STRATEGY

The PDF requires a 3D saloon interior but does not specify an exact asset.

Before choosing an external saloon model:

1. Check whether the repository already contains one.
2. Check whether the client supplied one.
3. Check its license.
4. Check polygon/texture complexity.
5. Check whether it can be converted/exported to GLB.
6. Check whether it is reasonable for browser/mobile rendering.

Do not use an enormous unoptimized environment if a lighter alternative can provide the same visual impression.

For example, a Western saloon asset exists on Sketchfab, but one currently indexed example is around 1M triangles, so it should not be blindly dropped into a mobile-first WebGL demo without optimization.

If necessary:

```text
Source asset
   ↓
Blender optimization
   ↓
Reduce geometry
   ↓
Compress/resize textures
   ↓
Export GLB
   ↓
React Three Fiber
```

---

# 10. 3D SCENE

The scene should communicate:

- Bloody Raven saloon;
- bar;
- tables;
- wall cabinets;
- bulletin board;
- atmospheric western lighting;
- host behind the bar.

The scene does NOT need to contain fully modeled game systems.

Use visual props only.

---

# 11. CAMERA

Primary target:

```text
9:16 portrait
```

The camera should frame the important visual hierarchy:

1. host;
2. bar;
3. main saloon environment;
4. hotspot areas.

Do not force all four hotspots to be huge and equally prominent.

The scene should feel like a real environment.

Hotspots can become visually obvious only when hovered.

---

# 12. HOTSPOT DESIGN

Create one reusable hotspot component/system.

Four hotspot areas:

## 1. Card-table area

Label:

```text
Card Rooms
```

Visual:

- green felt-inspired highlight;
- subtle glow;
- floating label.

## 2. Wall-cabinet area

Label:

```text
Slot Machines
```

Visual:

- amber highlight/flicker;
- subtle glow;
- floating label.

## 3. Bulletin board

Label:

```text
Faction War Map
```

Visual:

- paper/pin highlight;
- subtle glow;
- floating label.

## 4. Bar counter

Label:

```text
Shoot Your Shot Lounge
```

Visual:

- subtle bottle/bar highlight;
- floating label.

These labels and visual cues are based on the client PDF.

Do not implement the underlying destination systems.

---

# 13. HOTSPOT INTERACTION

The only hotspot interaction required:

```text
Pointer enters
     ↓
Raycast detects hotspot
     ↓
Highlight
     ↓
Floating label
     ↓
Host looks toward hotspot
```

On pointer leave:

```text
Highlight fades
Label fades
Host returns toward neutral
```

Important:

**Hotspots are NOT clickable.**

No navigation.

No page transition.

No modal.

No game launch.

No transaction.

No purchase.

---

# 14. WALLET

Implement:

- Solana WalletAdapter
- Phantom
- Devnet
- connect
- disconnect
- truncated address

Example UI:

```text
CONNECT WALLET
```

After connection:

```text
7xK2...9LmP
```

Wallet connection should be visually integrated into the western UI.

No transaction functionality is required.

---

# 15. UI STRUCTURE

Keep the page visually simple.

Suggested layers:

```text
Page
│
├── 3D Canvas
│
├── Top HUD
│   ├── Logo/title
│   └── Wallet control
│
├── Floating 3D labels
│
└── Optional bottom utility
    └── Ambient audio toggle
```

Avoid a large traditional website header.

The 3D world should dominate the screen.

---

# 16. TECH STACK

Use:

- Next.js 14
- TypeScript
- React Three Fiber
- Drei
- Three.js
- glTF/GLB
- Three.js AnimationMixer
- Solana WalletAdapter
- Phantom
- Solana Devnet
- R3F raycasting
- CSS/HTML overlays

Do not replace the stack unnecessarily.

---

# 17. RECOMMENDED COMPONENT STRUCTURE

Adapt to the actual repository.

Possible structure:

```text
src/
├── app/
│   ├── page.tsx
│   └── layout.tsx
│
├── components/
│   ├── scene/
│   │   ├── SaloonScene.tsx
│   │   ├── SaloonEnvironment.tsx
│   │   ├── HostAvatar.tsx
│   │   ├── Hotspot.tsx
│   │   ├── HotspotManager.tsx
│   │   └── FloatingLabel.tsx
│   │
│   ├── wallet/
│   │   ├── WalletProvider.tsx
│   │   ├── ConnectWallet.tsx
│   │   └── WalletHud.tsx
│   │
│   └── ui/
│       └── Hud.tsx
│
├── config/
│   └── hotspots.ts
│
├── hooks/
│   ├── useHotspotHover.ts
│   └── useHostLookAt.ts
│
└── types/
    └── scene.ts
```

Do not create unnecessary files if the existing repository already has a good structure.

---

# 18. DATA-DRIVEN HOTSPOTS

Prefer configuration like:

```ts
const hotspots = [
  {
    id: "card-room",
    label: "Card Rooms",
    position: [...],
    targetPosition: [...]
  },
  {
    id: "slots",
    label: "Slot Machines",
    position: [...],
    targetPosition: [...]
  },
  {
    id: "faction-map",
    label: "Faction War Map",
    position: [...],
    targetPosition: [...]
  },
  {
    id: "lounge",
    label: "Shoot Your Shot Lounge",
    position: [...],
    targetPosition: [...]
  }
];
```

Then render through one reusable component.

---

# 19. RESPONSIVE REQUIREMENTS

Mobile:

```text
9:16
```

Desktop:

```text
preserve 9:16 composition
letterbox
```

Do not stretch the 3D environment to fill arbitrary desktop aspect ratios.

Test:

- mobile portrait;
- narrow browser;
- 1366px desktop;
- 1920px desktop;
- resize.

---

# 20. PERFORMANCE

Because this is WebGL and mobile-first:

Prioritize:

- reasonable polygon count;
- optimized GLB;
- compressed textures where practical;
- limited dynamic lights;
- no unnecessary post-processing;
- no excessive particles;
- minimal React re-renders;
- efficient raycasting;
- correct animation cleanup.

A polished lightweight scene is better than an enormous scene that stutters.

---

# 21. DEVELOPMENT ORDER

Implement in this exact sequence unless repository constraints require a change.

## Phase 0
Repository audit.

## Phase 1
3D scene + camera + lighting + 9:16 composition.

## Phase 2
Host GLB + idle animation.

## Phase 3
Hotspot system + raycasting + labels.

## Phase 4
Host look-at reaction.

## Phase 5
Phantom wallet.

## Phase 6
Western UI polish.

## Phase 7
Performance + responsive QA.

---

# 22. CLAUDE CODE WORKFLOW

Do NOT make one enormous change.

For each phase:

```text
Inspect
↓
Plan
↓
Implement
↓
Run checks
↓
Fix
↓
Verify
↓
Report
↓
Next phase
```

Keep the application runnable after each major phase.

---

# 23. PHASE 0 — REQUIRED FIRST ACTION

Before editing anything:

Inspect:

- package.json
- lockfile
- src
- app/pages
- public
- assets
- existing GLB/GLTF
- wallet code
- R3F/Three.js code
- tsconfig
- eslint
- next.config
- environment configuration

Then report:

1. Existing architecture
2. Existing dependencies
3. Existing 3D assets
4. Existing UI assets
5. Existing wallet code
6. Missing assets
7. Risks/blockers
8. Exact Phase 1 plan

Do not build the entire application immediately.

---

# 24. IMPORTANT ASSET RULE

If the repository contains no 3D saloon or avatar assets:

Do not pretend they exist.

Instead:

1. tell me exactly what is missing;
2. identify what type of asset is needed;
3. suggest a suitable asset specification;
4. create the loader/component architecture;
5. use a clearly marked temporary placeholder only if needed to continue development.

For the final client demo, replace placeholders with properly licensed/approved assets.

---

# 25. ATTENTION-GRABBING BUT SCOPE-CONTROLLED DESIGN

The demo should feel premium through presentation rather than feature count.

Use:

- cinematic camera;
- strong composition;
- warm/cool lighting contrast;
- subtle volumetric-looking atmosphere if inexpensive;
- animated host;
- interactive hotspots;
- smooth transitions;
- elegant western HUD;
- subtle ambient sound toggle;
- polished loading state.

Do NOT add:

- extra pages;
- unnecessary menus;
- game mechanics;
- unnecessary backend;
- token/economy functionality;
- complex inventory;
- authentication system beyond the requested wallet connection.

---

# 26. LOADING EXPERIENCE

Because GLB assets may take time to load, provide a simple polished loading state.

Example:

```text
SOLSLINGER

Entering the Bloody Raven...
[ subtle loading indicator ]
```

Keep it lightweight.

The loading UI should disappear once the main scene is ready.

---

# 27. ERROR EXPERIENCE

Handle:

- WebGL unavailable;
- GLB load failure;
- wallet provider unavailable;
- wallet connection rejected.

Use clear but concise messages.

Do not expose raw technical stack traces to the user.

Keep detailed errors available in development console/logging.

---

# 28. FINAL CLIENT-DEMO CHECKLIST

## Scene

- [ ] Bloody Raven saloon visible
- [ ] Bar visible
- [ ] Tables visible
- [ ] Cabinets visible
- [ ] Bulletin board visible
- [ ] Western atmosphere
- [ ] Good camera framing
- [ ] 9:16 portrait composition

## Host

- [ ] Adult stylized female host
- [ ] GLB/glTF
- [ ] Behind bar
- [ ] Idle animation
- [ ] Looks toward hovered hotspot
- [ ] Smooth transitions

## Hotspots

- [ ] Card Rooms
- [ ] Slot Machines
- [ ] Faction War Map
- [ ] Shoot Your Shot Lounge
- [ ] Hover glow
- [ ] Floating label
- [ ] No navigation

## Wallet

- [ ] Phantom
- [ ] Solana Devnet
- [ ] Connect
- [ ] Address
- [ ] Disconnect
- [ ] No transactions

## UI

- [ ] Western visual language
- [ ] Clean HUD
- [ ] Mobile-first
- [ ] Desktop letterboxed
- [ ] Loading state
- [ ] Optional audio toggle

## Engineering

- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Build passes
- [ ] No major runtime errors
- [ ] Mobile smoke test
- [ ] Desktop smoke test

---

# 29. DEFINITION OF DONE

The demo is done when a client can open one URL and immediately see a polished Bloody Raven saloon.

They can:

1. see the 3D environment;
2. connect Phantom;
3. see their wallet address;
4. see the animated host;
5. hover the four important areas;
6. see each area respond visually;
7. see the host react;
8. understand that the areas represent future product destinations;
9. experience the scene correctly in 9:16 portrait;
10. see a clean letterboxed version on desktop.

No deeper game functionality is required.

---

# 30. MASTER INSTRUCTION TO CLAUDE CODE

You are not being asked to build the full Solslinger product.

You are being asked to build a **high-quality client-facing proof of concept**.

The correct strategy is:

```text
LESS FUNCTIONALITY
+
BETTER PRESENTATION
+
SMOOTH 3D INTERACTION
=
STRONGER CLIENT DEMO
```

Stay inside the original PDF scope.

Do not expand the product.

Do not invent requirements.

Do not over-engineer.

Make the single-page demo feel polished enough that the client can visualize the future product.

Start with the repository audit and report your findings before implementing Phase 1.
