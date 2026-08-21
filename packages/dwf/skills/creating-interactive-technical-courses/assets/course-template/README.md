# {{COURSE_TITLE}}

This is the maintainable source project for the generated interactive technical mini-course.

The project intentionally excludes `node_modules/` and compiled output.

## Build the single-file HTML

Requirements: a current Node.js/npm installation and npm registry access.

```bash
npm install
npm run build
```

`npm run build` type-checks the project, builds the release with Vite, inlines the application into one HTML file, and verifies the release structure.

Expected result:

```text
dist-release/
  index.html
```

Double-click `dist-release/index.html` to open it locally. The built course is designed to work offline through `file://` with no companion runtime files.

## Develop locally

```bash
npm install
npm run dev
```

## Course source and provenance

See `course-brief.json` for the intended audience, time budget, learning outcomes, scope, and source identifiers/revision recorded when this course was generated.
