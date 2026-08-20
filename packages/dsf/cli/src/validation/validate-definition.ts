import { discoverDeliveryRoot } from './discover.js';
import { sortFindings } from './findings.js';
import { validateGraphInvariants } from './graph.js';
import { loadDefinition } from './load.js';
import { validateArtifactSchema } from './schema.js';
import {
  DEFINITION_SCHEMA_VERSION,
  type Finding,
  type LoadedArtifact,
  type ValidateOutcome,
} from './types.js';

export function validateDeliveryDefinition(cwd: string): ValidateOutcome {
  const discovered = discoverDeliveryRoot(cwd);
  if (!discovered.ok) {
    return failure('VALIDATION_FAILED', discovered.findings);
  }

  const loaded = loadDefinition(discovered.deliveryRoot);
  const compatibility = compatibilityFindings(loaded.definition);
  if (compatibility.length > 0) {
    return {
      ok: false,
      code: 'COMPATIBILITY_UNSUPPORTED',
      message:
        'The Delivery Definition schema version is not supported by this CLI.',
      findings: sortFindings(compatibility),
    };
  }

  const findings: Finding[] = [...loaded.findings];
  if (loaded.definition.roadmap !== undefined) {
    findings.push(
      ...validateArtifactSchema('roadmap', loaded.definition.roadmap),
    );
  }
  for (const milestone of loaded.definition.milestones) {
    findings.push(...validateArtifactSchema('milestone', milestone));
  }
  for (const phase of loaded.definition.phases) {
    findings.push(...validateArtifactSchema('phase', phase));
  }
  for (const gap of loaded.definition.designGaps) {
    findings.push(...validateArtifactSchema('design-gap', gap));
  }

  findings.push(...validateGraphInvariants(loaded.definition));

  if (findings.length > 0) {
    return failure('VALIDATION_FAILED', findings);
  }

  return {
    ok: true,
    definitionSchemaVersion: DEFINITION_SCHEMA_VERSION,
    counts: {
      milestones: loaded.definition.milestones.length,
      phases: loaded.definition.phases.length,
      designGaps: loaded.definition.designGaps.length,
    },
  };
}

function compatibilityFindings(definition: {
  roadmap: LoadedArtifact | undefined;
  milestones: LoadedArtifact[];
  phases: LoadedArtifact[];
  designGaps: LoadedArtifact[];
}): Finding[] {
  const artifacts = [
    definition.roadmap,
    ...definition.milestones,
    ...definition.phases,
    ...definition.designGaps,
  ].filter((item): item is LoadedArtifact => item !== undefined);

  const findings: Finding[] = [];
  for (const artifact of artifacts) {
    if (
      artifact.value !== null &&
      typeof artifact.value === 'object' &&
      !Array.isArray(artifact.value) &&
      'schemaVersion' in artifact.value
    ) {
      const version = (artifact.value as { schemaVersion: unknown })
        .schemaVersion;
      if (
        typeof version === 'number' &&
        version !== DEFINITION_SCHEMA_VERSION
      ) {
        findings.push({
          kind: 'compatibility',
          artifact: artifact.artifact,
          path: '/schemaVersion',
          code: 'COMPATIBILITY_UNSUPPORTED',
          message: `Definition schema version ${String(version)} is not supported. This CLI validates version ${String(DEFINITION_SCHEMA_VERSION)}.`,
        });
      }
    }
  }
  return findings;
}

function failure(
  code: 'VALIDATION_FAILED' | 'COMPATIBILITY_UNSUPPORTED',
  findings: Finding[],
): ValidateOutcome {
  return {
    ok: false,
    code,
    message:
      code === 'COMPATIBILITY_UNSUPPORTED'
        ? 'The Delivery Definition schema version is not supported by this CLI.'
        : 'Delivery Definition validation failed',
    findings: sortFindings(findings),
  };
}
