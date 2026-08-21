import { ERROR_CODES, type ErrorCode } from './error-codes.js';

export const KNOWN_COMMANDS = new Set(['validate', 'docs']);

const TOPIC_ID_PATTERN = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)*$/;

export type DocsMode = 'index' | 'topic' | 'all';

export type ParsedCli =
  | { kind: 'help'; json: boolean; topic: 'delivery' | 'validate' | 'docs' }
  | { kind: 'version'; json: boolean }
  | { kind: 'validate'; json: boolean }
  | { kind: 'docs'; json: boolean; mode: DocsMode; topic?: string }
  | {
      kind: 'error';
      json: boolean;
      command: string;
      code: ErrorCode;
      message: string;
      details?: Record<string, unknown>;
    };

export function parseArgv(argv: readonly string[]): ParsedCli {
  let json = false;
  let help = false;
  let version = false;
  let indexFlag = false;
  let allFlag = false;
  let command: string | undefined;
  const positionals: string[] = [];
  const unknownOptions: string[] = [];
  const docsOptions: string[] = [];

  for (const token of argv) {
    if (token === '--json') {
      json = true;
    } else if (token === '--help' || token === '-h') {
      help = true;
    } else if (token === '--version') {
      version = true;
    } else if (token === '--index' || token === '-i') {
      indexFlag = true;
      docsOptions.push(token);
    } else if (token === '--all' || token === '-a') {
      allFlag = true;
      docsOptions.push(token);
    } else if (token.startsWith('-')) {
      unknownOptions.push(token);
    } else if (command === undefined) {
      command = token;
    } else {
      positionals.push(token);
    }
  }

  const envelopeCommand =
    command ?? (help ? 'help' : version ? 'version' : 'delivery');

  const unknownOption = unknownOptions[0];
  if (unknownOption !== undefined) {
    return error({
      json,
      command: envelopeCommand,
      code: ERROR_CODES.UNKNOWN_OPTION,
      message: `Unknown option: ${unknownOption}`,
      details: { options: unknownOptions },
    });
  }

  if (command !== 'docs') {
    const docsOption = docsOptions[0];
    if (docsOption !== undefined) {
      return error({
        json,
        command: envelopeCommand,
        code: ERROR_CODES.UNKNOWN_OPTION,
        message: `Unknown option: ${docsOption}`,
        details: { options: docsOptions },
      });
    }
  }

  if (help) {
    if (command !== undefined && !KNOWN_COMMANDS.has(command)) {
      return error({
        json,
        command: 'help',
        code: ERROR_CODES.UNKNOWN_COMMAND,
        message: `Unknown command: ${command}`,
        details: { command },
      });
    }
    const topic =
      command === 'validate' || command === 'docs' ? command : 'delivery';
    return { kind: 'help', json, topic };
  }

  if (version) {
    if (command !== undefined) {
      return error({
        json,
        command,
        code: ERROR_CODES.INVALID_INVOCATION,
        message:
          '--version is a top-level flag and cannot be combined with a command',
      });
    }
    return { kind: 'version', json };
  }

  if (command === undefined) {
    return error({
      json,
      command: 'delivery',
      code: ERROR_CODES.MISSING_COMMAND,
      message: 'Missing command. See --help.',
    });
  }

  if (!KNOWN_COMMANDS.has(command)) {
    return error({
      json,
      command,
      code: ERROR_CODES.UNKNOWN_COMMAND,
      message: `Unknown command: ${command}`,
      details: { command },
    });
  }

  if (command === 'validate') {
    const unexpectedArgument = positionals[0];
    if (unexpectedArgument !== undefined) {
      return error({
        json,
        command,
        code: ERROR_CODES.INVALID_INVOCATION,
        message: `Unexpected argument: ${unexpectedArgument}`,
        details: { arguments: positionals },
      });
    }
    return { kind: 'validate', json };
  }

  if (indexFlag && allFlag) {
    return error({
      json,
      command: 'docs',
      code: ERROR_CODES.INVALID_INVOCATION,
      message: '--index and --all cannot be combined',
      details: { options: ['--index', '--all'] },
    });
  }

  if (positionals.length > 1) {
    const unexpectedArgument = positionals[1]!;
    return error({
      json,
      command: 'docs',
      code: ERROR_CODES.INVALID_INVOCATION,
      message: `Unexpected argument: ${unexpectedArgument}`,
      details: { arguments: positionals },
    });
  }

  const topic = positionals[0];
  if (topic !== undefined && !TOPIC_ID_PATTERN.test(topic)) {
    return error({
      json,
      command: 'docs',
      code: ERROR_CODES.INVALID_INVOCATION,
      message: `Invalid documentation topic id: ${topic}`,
      details: { topic },
    });
  }

  const mode: DocsMode = allFlag
    ? 'all'
    : indexFlag || topic === undefined
      ? 'index'
      : 'topic';

  if (topic === undefined) {
    return { kind: 'docs', json, mode };
  }
  return { kind: 'docs', json, mode, topic };
}

function error(input: {
  json: boolean;
  command: string;
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}): Extract<ParsedCli, { kind: 'error' }> {
  const parsed: Extract<ParsedCli, { kind: 'error' }> = {
    kind: 'error',
    json: input.json,
    command: input.command,
    code: input.code,
    message: input.message,
  };
  if (input.details !== undefined) {
    parsed.details = input.details;
  }
  return parsed;
}
