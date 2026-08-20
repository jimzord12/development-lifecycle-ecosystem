import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../fixtures');

const milestone = (id, extra = {}) => ({
  kind: 'delivery-milestone',
  schemaVersion: 2,
  id,
  title: `${id} title`,
  objective: `${id} objective.`,
  governingDesignReferences: ['SPEC.md'],
  dependsOn: [],
  acceptanceCriteria: [
    { key: 'AC-01', requirement: `${id} is observably complete.` },
  ],
  verification: [
    {
      key: 'VR-01',
      covers: ['AC-01'],
      requirement: `Prove ${id} is complete.`,
    },
  ],
  completionEvidence: [
    { key: 'EV-01', requirement: `Retain proof for ${id}.` },
  ],
  ...extra,
});

const capability = (id, extra = {}) => ({
  kind: 'delivery-phase',
  schemaVersion: 2,
  id,
  title: `${id} title`,
  milestoneId: 'M-001',
  type: 'CAPABILITY',
  objective: `${id} objective.`,
  scope: {
    in: [`Work required for ${id}.`],
    out: ['Unrelated later work.'],
  },
  fitness: {
    coherentOutcome: true,
    coherentVerification: true,
    boundedContext: true,
    manageableDecomposition: true,
    rationale: 'One independently verifiable outcome.',
  },
  governingDesignReferences: ['SPEC.md'],
  supportingConceptReferences: [],
  repositories: ['app'],
  dependsOn: [],
  establishesArchitecturalSubsystems: [],
  consumesArchitecturalSubsystems: [],
  externalPrerequisites: [],
  acceptanceCriteria: [{ key: 'AC-01', requirement: `${id} works.` }],
  verification: [
    {
      key: 'VR-01',
      covers: ['AC-01'],
      requirement: `Test ${id}.`,
    },
  ],
  completionEvidence: [{ key: 'EV-01', requirement: `Keep ${id} evidence.` }],
  ...extra,
});

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeDefinition(name, files) {
  const base = join(root, name, 'delivery');
  rmSync(join(root, name), { recursive: true, force: true });
  for (const [relative, value] of Object.entries(files)) {
    writeJson(join(base, relative), value);
  }
}

const roadmap = {
  kind: 'delivery-roadmap',
  schemaVersion: 2,
  title: 'Example Delivery',
  repositories: { app: { identity: 'example-app' } },
  milestoneOrder: ['M-001'],
};

writeDefinition('valid-minimal', {
  'roadmap.json': roadmap,
  'milestones/M-001.json': milestone('M-001'),
  'phases/P-001.json': capability('P-001'),
});

writeDefinition('valid-multi-milestone', {
  'roadmap.json': {
    ...roadmap,
    title: 'Multi-milestone example',
    milestoneOrder: ['M-001', 'M-002'],
  },
  'milestones/M-001.json': milestone('M-001'),
  'milestones/M-002.json': milestone('M-002', { dependsOn: ['M-001'] }),
  'phases/P-001.json': capability('P-001'),
  'phases/P-002.json': capability('P-002', {
    milestoneId: 'M-002',
    dependsOn: ['P-001'],
  }),
});

writeDefinition('invalid-schema', {
  'roadmap.json': {
    kind: 'delivery-roadmap',
    schemaVersion: 2,
    repositories: { app: { identity: 'example-app' } },
    milestoneOrder: ['M-001'],
  },
  'milestones/M-001.json': milestone('M-001'),
  'phases/P-001.json': capability('P-001'),
});

writeDefinition('invalid-missing-reference', {
  'roadmap.json': roadmap,
  'milestones/M-001.json': milestone('M-001'),
  'phases/P-001.json': capability('P-001', { dependsOn: ['P-999'] }),
});

writeDefinition('invalid-duplicate-id', {
  'roadmap.json': roadmap,
  'milestones/M-001.json': milestone('M-001'),
  'phases/P-001.json': capability('P-001'),
  'phases/P-002.json': capability('P-001', {
    id: 'P-001',
    title: 'Duplicate id',
  }),
});

writeDefinition('invalid-dependency-cycle', {
  'roadmap.json': roadmap,
  'milestones/M-001.json': milestone('M-001'),
  'phases/P-001.json': capability('P-001', { dependsOn: ['P-002'] }),
  'phases/P-002.json': capability('P-002', { dependsOn: ['P-001'] }),
});

writeDefinition('unsupported-schema-version', {
  'roadmap.json': { ...roadmap, schemaVersion: 99 },
  'milestones/M-001.json': milestone('M-001'),
  'phases/P-001.json': capability('P-001'),
});

console.log('wrote fixtures');
