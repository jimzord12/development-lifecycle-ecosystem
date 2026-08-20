export const DEFINITION_SCHEMA_VERSION = 2;

export type FindingKind = 'discovery' | 'schema' | 'graph' | 'compatibility';

export type Finding = {
  kind: FindingKind;
  artifact: string;
  path: string;
  code: string;
  message: string;
};

export type LoadedArtifact = {
  artifact: string;
  filePath: string;
  value: unknown;
};

export type LoadedDefinition = {
  deliveryRoot: string;
  roadmap: LoadedArtifact | undefined;
  milestones: LoadedArtifact[];
  phases: LoadedArtifact[];
  designGaps: LoadedArtifact[];
};

export type ValidateSuccess = {
  ok: true;
  definitionSchemaVersion: typeof DEFINITION_SCHEMA_VERSION;
  counts: {
    milestones: number;
    phases: number;
    designGaps: number;
  };
};

export type ValidateFailure = {
  ok: false;
  code: 'VALIDATION_FAILED' | 'COMPATIBILITY_UNSUPPORTED';
  message: string;
  findings: Finding[];
};

export type ValidateOutcome = ValidateSuccess | ValidateFailure;
