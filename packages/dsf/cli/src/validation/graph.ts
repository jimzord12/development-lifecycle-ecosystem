import { basename } from 'node:path';

import { jsonPointer } from './findings.js';
import type { Finding, LoadedArtifact, LoadedDefinition } from './types.js';

type RecordObject = Record<string, unknown>;

export function validateGraphInvariants(
  definition: LoadedDefinition,
): Finding[] {
  const findings: Finding[] = [];
  const roadmap = asObject(definition.roadmap?.value);
  const milestones = definition.milestones;
  const phases = definition.phases;
  const designGaps = definition.designGaps;

  const milestoneById = indexById(milestones, /^M-[0-9]{3,}$/, findings);
  const phaseById = indexById(phases, /^P-[0-9]{3,}$/, findings);
  indexById(designGaps, /^DG-[0-9]{3,}$/, findings);

  assertFileIdentity(milestones, /^M-[0-9]{3,}$/, findings);
  assertFileIdentity(phases, /^P-[0-9]{3,}$/, findings);
  assertFileIdentity(designGaps, /^DG-[0-9]{3,}$/, findings);

  if (definition.roadmap !== undefined && roadmap !== undefined) {
    const order = asStringArray(roadmap['milestoneOrder']);
    order.forEach((id, index) => {
      if (!milestoneById.has(id)) {
        findings.push({
          kind: 'graph',
          artifact: definition.roadmap?.artifact ?? 'roadmap.json',
          path: jsonPointer(['milestoneOrder', index]),
          code: 'REFERENCE_NOT_FOUND',
          message: `Referenced Milestone ${id} does not exist.`,
        });
      }
    });

    const repositories = asObject(roadmap['repositories']) ?? {};
    const repositoryIds = new Set(Object.keys(repositories));

    for (const phase of phases) {
      const value = asObject(phase.value);
      if (value === undefined) {
        continue;
      }
      const repoRefs = asStringArray(value['repositories']);
      repoRefs.forEach((repoId, index) => {
        if (!repositoryIds.has(repoId)) {
          findings.push({
            kind: 'graph',
            artifact: phase.artifact,
            path: jsonPointer(['repositories', index]),
            code: 'REFERENCE_NOT_FOUND',
            message: `Referenced repository '${repoId}' is not in the Roadmap registry.`,
          });
        }
      });
    }
  }

  for (const milestone of milestones) {
    const value = asObject(milestone.value);
    if (value === undefined) {
      continue;
    }
    assertReferencesExist(
      findings,
      milestone.artifact,
      'dependsOn',
      asStringArray(value['dependsOn']),
      milestoneById,
      'Milestone',
    );
    assertVerificationCoversAcceptance(findings, milestone);
  }

  assertNoCycles(findings, 'Milestone', milestones, (item) =>
    asStringArray(asObject(item.value)?.['dependsOn']),
  );

  const establishedSubsystems = new Set<string>();
  for (const phase of phases) {
    const value = asObject(phase.value);
    if (value === undefined) {
      continue;
    }
    if (value['type'] === 'FOUNDATION') {
      for (const id of asStringArray(
        value['establishesArchitecturalSubsystems'],
      )) {
        establishedSubsystems.add(id);
      }
    }
  }

  for (const phase of phases) {
    const value = asObject(phase.value);
    if (value === undefined) {
      continue;
    }
    const milestoneId = value['milestoneId'];
    if (typeof milestoneId === 'string' && !milestoneById.has(milestoneId)) {
      findings.push({
        kind: 'graph',
        artifact: phase.artifact,
        path: jsonPointer(['milestoneId']),
        code: 'REFERENCE_NOT_FOUND',
        message: `Referenced Milestone ${milestoneId} does not exist.`,
      });
    }
    assertReferencesExist(
      findings,
      phase.artifact,
      'dependsOn',
      asStringArray(value['dependsOn']),
      phaseById,
      'Phase',
    );
    assertReferencesExist(
      findings,
      phase.artifact,
      'consumedBy',
      asStringArray(value['consumedBy']),
      phaseById,
      'Phase',
    );
    asStringArray(value['consumesArchitecturalSubsystems']).forEach(
      (id, index) => {
        if (!establishedSubsystems.has(id)) {
          findings.push({
            kind: 'graph',
            artifact: phase.artifact,
            path: jsonPointer(['consumesArchitecturalSubsystems', index]),
            code: 'REFERENCE_NOT_FOUND',
            message: `Referenced Architectural Subsystem ${id} is not established by a Foundation Phase.`,
          });
        }
      },
    );
    assertVerificationCoversAcceptance(findings, phase);
  }

  assertNoCycles(findings, 'Phase', phases, (item) =>
    asStringArray(asObject(item.value)?.['dependsOn']),
  );

  for (const gap of designGaps) {
    const value = asObject(gap.value);
    const phaseId = value?.['phaseId'];
    if (typeof phaseId === 'string' && !phaseById.has(phaseId)) {
      findings.push({
        kind: 'graph',
        artifact: gap.artifact,
        path: jsonPointer(['phaseId']),
        code: 'REFERENCE_NOT_FOUND',
        message: `Referenced Phase ${phaseId} does not exist.`,
      });
    }
  }

  return findings;
}

function indexById(
  artifacts: LoadedArtifact[],
  pattern: RegExp,
  findings: Finding[],
): Map<string, LoadedArtifact> {
  const map = new Map<string, LoadedArtifact>();
  for (const artifact of artifacts) {
    const id = asObject(artifact.value)?.['id'];
    if (typeof id !== 'string' || !pattern.test(id)) {
      continue;
    }
    const existing = map.get(id);
    if (existing !== undefined) {
      findings.push({
        kind: 'graph',
        artifact: artifact.artifact,
        path: jsonPointer(['id']),
        code: 'DUPLICATE_ID',
        message: `${id} is declared in both ${existing.artifact} and ${artifact.artifact}.`,
      });
      continue;
    }
    map.set(id, artifact);
  }
  return map;
}

function assertFileIdentity(
  artifacts: LoadedArtifact[],
  pattern: RegExp,
  findings: Finding[],
): void {
  for (const artifact of artifacts) {
    const id = asObject(artifact.value)?.['id'];
    if (typeof id !== 'string' || !pattern.test(id)) {
      continue;
    }
    const fileId = basename(artifact.artifact).replace(/\.json$/u, '');
    if (fileId !== id) {
      findings.push({
        kind: 'graph',
        artifact: artifact.artifact,
        path: jsonPointer(['id']),
        code: 'FILE_IDENTITY_MISMATCH',
        message: `File ${artifact.artifact} must be named ${id}.json.`,
      });
    }
  }
}

function assertReferencesExist(
  findings: Finding[],
  artifact: string,
  field: string,
  ids: string[],
  existing: Map<string, LoadedArtifact>,
  label: string,
): void {
  ids.forEach((id, index) => {
    if (!existing.has(id)) {
      findings.push({
        kind: 'graph',
        artifact,
        path: jsonPointer([field, index]),
        code: 'REFERENCE_NOT_FOUND',
        message: `Referenced ${label} ${id} does not exist.`,
      });
    }
  });
}

function assertVerificationCoversAcceptance(
  findings: Finding[],
  artifact: LoadedArtifact,
): void {
  const value = asObject(artifact.value);
  if (value === undefined) {
    return;
  }
  const acceptanceKeys = new Set(
    asObjectArray(value['acceptanceCriteria'])
      .map((item) => item['key'])
      .filter((key): key is string => typeof key === 'string'),
  );
  asObjectArray(value['verification']).forEach((clause, index) => {
    asStringArray(clause['covers']).forEach((key, coverIndex) => {
      if (!acceptanceKeys.has(key)) {
        findings.push({
          kind: 'graph',
          artifact: artifact.artifact,
          path: jsonPointer(['verification', index, 'covers', coverIndex]),
          code: 'REFERENCE_NOT_FOUND',
          message: `Verification covers unknown acceptance key ${key}.`,
        });
      }
    });
  });
}

function assertNoCycles(
  findings: Finding[],
  label: string,
  artifacts: LoadedArtifact[],
  edgesOf: (artifact: LoadedArtifact) => string[],
): void {
  const ids = artifacts
    .map((item) => asObject(item.value)?.['id'])
    .filter((id): id is string => typeof id === 'string')
    .sort((left, right) => left.localeCompare(right));
  const byId = new Map<string, LoadedArtifact>();
  for (const artifact of artifacts) {
    const id = asObject(artifact.value)?.['id'];
    if (typeof id === 'string') {
      byId.set(id, artifact);
    }
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];
  let reported = false;

  const visit = (id: string): void => {
    if (reported || visited.has(id)) {
      return;
    }
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      const cycle = stack.slice(start).concat(id);
      const artifact = byId.get(id);
      findings.push({
        kind: 'graph',
        artifact: artifact?.artifact ?? `${label.toLowerCase()}s/${id}.json`,
        path: jsonPointer(['dependsOn']),
        code: 'DEPENDENCY_CYCLE',
        message: `${label} dependency cycle: ${cycle.join(' -> ')}.`,
      });
      reported = true;
      return;
    }
    visiting.add(id);
    stack.push(id);
    const node = byId.get(id);
    if (node !== undefined) {
      for (const next of edgesOf(node)) {
        visit(next);
      }
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  };

  for (const id of ids) {
    visit(id);
  }
}

function asObject(value: unknown): RecordObject | undefined {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return value as RecordObject;
  }
  return undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function asObjectArray(value: unknown): RecordObject[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => {
    const object = asObject(item);
    return object === undefined ? [] : [object];
  });
}
