# Technical Architecture

## Delivery contract

The **agent-facing deliverable** is a ready-to-build **source ZIP**. It must not require npm registry/network access inside the agent runtime.

The ZIP contains a normal React/TypeScript/Vite source project. On a developer machine with Node/npm and registry access, the documented command:

```bash
npm install
npm run build
```

must produce and mechanically verify one self-contained HTML file.

The built HTML is the **developer/learner release artifact**, not the default agent-runtime deliverable.

## Built-release invariant

The local build must produce a **verified self-contained HTML file** that:

- opens directly via `file://`;
- requires no Node.js/runtime installation for the learner;
- requires no local HTTP server;
- performs no required network requests;
- performs no required filesystem-relative requests;
- contains all required JS, CSS, data, SVG/images/fonts/assets.

Treat this as a release property, not as a reason to contort authoring code.

## Default authoring stack

Spike baseline (August 2026):

- React 19.2.x
- TypeScript 6.x
- Vite 8.x
- `@vitejs/plugin-react`
- `vite-plugin-singlefile` 2.3.x
- React Router 8.x `HashRouter` only when real chapter navigation is useful

Use the bundled template unless the user's environment already supplies a compatible project.

The exact dependency versions may age. Preserve the architecture invariant if packages change.

## Source ZIP contents

Include at least:

- source code and imported local assets;
- `package.json`;
- Vite/TypeScript configuration;
- `README.md` with the short build instructions;
- `course-brief.json` with audience/outcomes/time/scope/source revision when available;
- a local release verifier invoked by `npm run build`.

Exclude:

- `node_modules/`;
- `dist/`, `dist-release/`, or other compiled outputs;
- caches;
- VCS metadata;
- editor/OS junk.

## Why `file://` changes the built architecture

Do not design a normal multi-file SPA and assume the browser will treat sibling local resources like an HTTP origin.

Avoid runtime patterns such as:

```ts
fetch('./course.json');
new Worker('./worker.js');
```

or external/local assets such as:

```html
<img src="./assets/diagram.png" /> <link rel="stylesheet" href="./styles.css" />
```

Instead, import build-time resources through Vite and let the single-file build inline them.

## Routing

Prefer, in order:

1. simple React state for tiny courses;
2. React Router `HashRouter` for meaningful chapter/back-forward navigation.

Do not use `BrowserRouter` for a `file://` artifact.

## Assets

Prefer:

- React-authored inline SVG for major learning diagrams;
- imported JSON/data at build time;
- imported raster assets only when necessary;
- system font stack.

Do not use:

- Google Fonts;
- CDN icons;
- remote images;
- runtime Mermaid CDN;
- analytics scripts;
- external video/audio required for the main path.

Large media-heavy courses are outside this spike's happy path.

## Animation

Start with CSS transitions/animations.

Add a dedicated motion library only when a real interaction requires coordinated state/layout animation that CSS would make brittle.

Do not add animation libraries by default.

## State

Use:

```text
useState
→ useReducer when transition logic becomes non-trivial
→ Context for small course-wide settings/progress
→ stop
```

Do not add Zustand/Redux/etc. without a demonstrated problem.

## Persistence

`localStorage` may remember progress as a best-effort convenience, but the course must work correctly without it because `file:` storage semantics are not a durable contract.

Never make correctness or navigation depend on persistence.

## Local build contract

The bundled template makes the ordinary build command the release command:

```bash
npm install
npm run build
```

`npm run build` must:

1. type-check;
2. build in Vite release mode with `vite-plugin-singlefile`;
3. verify the generated release structure.

Expected output:

```text
dist-release/
  index.html
```

No additional runtime files should remain.

## Browser target

Happy path:

- modern Chromium/Chrome/Edge;
- modern Firefox;
- modern Safari.

The project README should recommend opening `dist-release/index.html` directly after the build and doing a quick browser smoke test before broad distribution.

## Accessibility baseline

Use semantic HTML and real buttons/inputs.

Require:

- visible keyboard focus;
- keyboard-operable controls;
- readable contrast;
- no color-only state;
- `prefers-reduced-motion` handling;
- diagram text alternative/adjacent explanation when needed.

Do not turn the spike into a full accessibility-certification project.

## Security/privacy

Everything embedded in the built HTML is inspectable by the recipient.

Never include:

- secrets;
- API keys;
- data the recipient should not possess;
- hidden proprietary answers that are expected to remain secret.

Minification is not a security boundary.
