import {
  failureEnvelope,
  renderOutput,
  successEnvelope,
  type CliError,
  type RunCliResult,
} from './envelope.js';
import { TOP_LEVEL_HELP, VALIDATE_HELP } from './help.js';
import {
  CLI_NAME,
  CLI_VERSION,
  COMPONENT_ID,
  COMPONENT_VERSION,
  DLE_CLI_STANDARD,
} from './identity.js';
import { parseArgv } from './parse.js';
import { isSecretKey } from './redact.js';
import { validateDeliveryDefinition } from './validation/validate-definition.js';
import type { ValidateOutcome } from './validation/types.js';

export type { RunCliResult };

export type RunCliOptions = {
  cwd?: string;
  env?: Record<string, string | undefined>;
  stdoutIsTty?: boolean;
  stderrIsTty?: boolean;
};

export function runCli(
  argv: readonly string[],
  options: RunCliOptions = {},
): RunCliResult {
  const parsed = parseArgv(argv);
  let output: RunCliResult;

  if (parsed.kind === 'help') {
    const text = parsed.topic === 'validate' ? VALIDATE_HELP : TOP_LEVEL_HELP;
    output = renderOutput(
      successEnvelope('help', { topic: parsed.topic, text }),
      {
        json: parsed.json,
        humanText: text,
      },
    );
  } else if (parsed.kind === 'version') {
    const result = {
      cli: { name: CLI_NAME, version: CLI_VERSION },
      component: { id: COMPONENT_ID, version: COMPONENT_VERSION },
      dleCliStandard: DLE_CLI_STANDARD,
    };
    const humanText = `${CLI_NAME} ${CLI_VERSION}\ncomponent: ${COMPONENT_ID} ${COMPONENT_VERSION}\ndleCliStandard: ${DLE_CLI_STANDARD}\n`;
    output = renderOutput(successEnvelope('version', result), {
      json: parsed.json,
      humanText,
    });
  } else if (parsed.kind === 'validate') {
    const cwd = options.cwd ?? process.cwd();
    output = renderValidate(validateDeliveryDefinition(cwd), parsed.json);
  } else {
    const error: CliError = { code: parsed.code, message: parsed.message };
    if (parsed.details !== undefined) {
      error.details = parsed.details;
    }
    output = renderOutput(failureEnvelope(parsed.command, error), {
      json: parsed.json,
    });
  }

  assertNoSecretEnvLeak(output, options.env);
  return output;
}

function renderValidate(
  outcome: ValidateOutcome,
  json: boolean,
): ReturnType<typeof renderOutput> {
  if (outcome.ok) {
    const result = {
      valid: true,
      definitionSchemaVersion: outcome.definitionSchemaVersion,
      counts: outcome.counts,
    };
    const humanText = `Delivery Definition is valid (schema v${String(outcome.definitionSchemaVersion)}).\nmilestones: ${String(outcome.counts.milestones)}\nphases: ${String(outcome.counts.phases)}\ndesignGaps: ${String(outcome.counts.designGaps)}\n`;
    return renderOutput(successEnvelope('validate', result), {
      json,
      humanText,
    });
  }

  const error: CliError = {
    code: outcome.code,
    message: outcome.message,
    details: { findings: outcome.findings },
  };
  return renderOutput(failureEnvelope('validate', error), { json });
}

function assertNoSecretEnvLeak(
  output: RunCliResult,
  env: Record<string, string | undefined> | undefined,
): void {
  if (env === undefined) {
    return;
  }

  for (const [key, value] of Object.entries(env)) {
    if (typeof value !== 'string' || value.length === 0 || !isSecretKey(key)) {
      continue;
    }
    if (output.stdout.includes(value) || output.stderr.includes(value)) {
      throw new Error(`Refusing to emit environment value for ${key}`);
    }
  }
}
