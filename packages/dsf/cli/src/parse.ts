import { ERROR_CODES, type ErrorCode } from './error-codes.js';

export const KNOWN_COMMANDS = new Set(['validate']);

export type ParsedCli =
  | { kind: 'help'; json: boolean; topic: 'delivery' | 'validate' }
  | { kind: 'version'; json: boolean }
  | { kind: 'validate'; json: boolean }
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
  let command: string | undefined;
  const positionals: string[] = [];
  const unknownOptions: string[] = [];

  for (const token of argv) {
    if (token === '--json') {
      json = true;
    } else if (token === '--help' || token === '-h') {
      help = true;
    } else if (token === '--version') {
      version = true;
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
    return {
      kind: 'help',
      json,
      topic: command === 'validate' ? 'validate' : 'delivery',
    };
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
