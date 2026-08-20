import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';

import { jsonPointer } from './findings.js';
import type { Finding, LoadedArtifact, LoadedDefinition } from './types.js';

export function loadDefinition(deliveryRoot: string): {
  definition: LoadedDefinition;
  findings: Finding[];
} {
  const findings: Finding[] = [];
  const roadmapPath = join(deliveryRoot, 'roadmap.json');
  const definition: LoadedDefinition = {
    deliveryRoot,
    roadmap: undefined,
    milestones: loadJsonDirectory(
      deliveryRoot,
      join(deliveryRoot, 'milestones'),
      findings,
    ),
    phases: loadJsonDirectory(
      deliveryRoot,
      join(deliveryRoot, 'phases'),
      findings,
    ),
    designGaps: loadJsonDirectory(
      deliveryRoot,
      join(deliveryRoot, 'design-gaps'),
      findings,
    ),
  };

  if (!existsSync(roadmapPath) || !statSync(roadmapPath).isFile()) {
    findings.push({
      kind: 'discovery',
      artifact: 'roadmap.json',
      path: '/',
      code: 'DEFINITION_NOT_FOUND',
      message: 'delivery/roadmap.json is required.',
    });
  } else {
    definition.roadmap = readJsonArtifact(deliveryRoot, roadmapPath, findings);
  }

  return { definition, findings };
}

function loadJsonDirectory(
  deliveryRoot: string,
  directory: string,
  findings: Finding[],
): LoadedArtifact[] {
  if (!existsSync(directory) || !statSync(directory).isDirectory()) {
    return [];
  }

  const names = readdirSync(directory)
    .filter((name) => name.endsWith('.json'))
    .sort((left, right) => left.localeCompare(right));

  const artifacts: LoadedArtifact[] = [];
  for (const name of names) {
    const filePath = join(directory, name);
    if (!statSync(filePath).isFile()) {
      continue;
    }
    const loaded = readJsonArtifact(deliveryRoot, filePath, findings);
    if (loaded !== undefined) {
      artifacts.push(loaded);
    }
  }
  return artifacts;
}

function readJsonArtifact(
  deliveryRoot: string,
  filePath: string,
  findings: Finding[],
): LoadedArtifact | undefined {
  const artifact = toPosix(relative(deliveryRoot, filePath));
  const raw = readFileSync(filePath, 'utf8');
  try {
    return {
      artifact,
      filePath,
      value: JSON.parse(raw) as unknown,
    };
  } catch {
    findings.push({
      kind: 'schema',
      artifact,
      path: jsonPointer([]),
      code: 'INVALID_JSON',
      message: `${basename(filePath)} is not valid JSON.`,
    });
    return undefined;
  }
}

function toPosix(path: string): string {
  return path.replaceAll('\\', '/');
}
