import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as Ajv2020Module from 'ajv/dist/2020.js';
import type { ErrorObject, ValidateFunction } from 'ajv';

type Ajv2020Constructor = new (options?: {
  allErrors?: boolean;
  strict?: boolean;
  validateSchema?: boolean;
}) => { compile: (schema: object) => ValidateFunction };

const Ajv2020 = (Ajv2020Module as unknown as { default: Ajv2020Constructor })
  .default;

import { resolveSchemaDirectory } from './schema-assets.js';
import type { Finding, LoadedArtifact } from './types.js';

const SCHEMA_FILES = {
  roadmap: 'roadmap.schema.json',
  milestone: 'milestone.schema.json',
  phase: 'phase.schema.json',
  'design-gap': 'design-gap.schema.json',
} as const;

export type ArtifactKind = keyof typeof SCHEMA_FILES;

let validators: Record<ArtifactKind, ValidateFunction> | undefined;

export function compileDefinitionSchemas(): Record<
  ArtifactKind,
  ValidateFunction
> {
  if (validators !== undefined) {
    return validators;
  }

  const directory = resolveSchemaDirectory();
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    validateSchema: true,
  });

  const compiled = {} as Record<ArtifactKind, ValidateFunction>;
  for (const [kind, fileName] of Object.entries(SCHEMA_FILES) as Array<
    [ArtifactKind, string]
  >) {
    const schema = JSON.parse(
      readFileSync(join(directory, fileName), 'utf8'),
    ) as object;
    compiled[kind] = ajv.compile(schema);
  }
  validators = compiled;
  return compiled;
}

export function schemaDialect(): string {
  const directory = resolveSchemaDirectory();
  const roadmap = JSON.parse(
    readFileSync(join(directory, SCHEMA_FILES.roadmap), 'utf8'),
  ) as { $schema?: string };
  return roadmap.$schema ?? '';
}

export function validateArtifactSchema(
  kind: ArtifactKind,
  artifact: LoadedArtifact,
): Finding[] {
  const validate = compileDefinitionSchemas()[kind];
  const valid = validate(artifact.value);
  if (valid) {
    return [];
  }
  return (validate.errors ?? []).map((error) =>
    toFinding(artifact.artifact, error),
  );
}

function toFinding(artifact: string, error: ErrorObject): Finding {
  const path = error.instancePath === '' ? '/' : error.instancePath;
  return {
    kind: 'schema',
    artifact,
    path,
    code: 'SCHEMA_INVALID',
    message: error.message ?? 'Schema validation failed.',
  };
}
