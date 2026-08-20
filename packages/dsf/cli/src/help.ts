export const TOP_LEVEL_HELP = `delivery — Delivery CLI for the Delivery System Framework (DSF)

A non-interactive, optional companion CLI. It validates Delivery Definitions
and, when the CLI profile is adopted, operates CLI-owned execution state.
It is not a source of design truth.

USAGE
  delivery [--json] --help
  delivery [--json] --version
  delivery [--json] validate

OPTIONS
  -h, --help     Print help and exit 0. No prompt. No pager.
  --version      Print CLI identity (name, version, owning DSF, DLE CLI Standard).
  --json         Machine-readable JSON only: one UTF-8 document plus a newline.

COMMANDS
  validate       Read-only validation. No repair and no mutation.

DEFAULTS
  Output is human-readable unless --json is passed.
  The CLI never prompts and never reads stdin unless a later documented option says so.
  This bootstrap recognizes no environment variables and no config file.

SIDE EFFECTS
  --help, --version, and validate do not write files or mutate Git.

EXAMPLES
  delivery --help
  delivery validate --help
  delivery --version --json
  delivery validate --json

EXIT CODES
  0    success
  !=0  failure. Automation should branch on JSON error.code, not the numeric code.

This bootstrap implements the DLE CLI Standard V1 universal surface only.
Delivery domain commands are not implemented yet.
`;

export const VALIDATE_HELP = `delivery validate — read-only Delivery Definition validation

USAGE
  delivery [--json] validate

ARGUMENTS
  none in this bootstrap

OPTIONS
  -h, --help     Print this help and exit 0.
  --json         Machine-readable JSON only: one UTF-8 document plus a newline.

DEFAULTS
  Human-readable output unless --json is passed.

SIDE EFFECTS
  None. validate never repairs, writes, or mutates Git.

BEHAVIOR
  Until authoritative DSF Delivery Definition schemas are published, validate
  fails closed with error.code DELIVERY_ENGINE_NOT_IMPLEMENTED. That is not a
  successful no-op and is not a schema-validity verdict.

EXAMPLES
  delivery validate --help
  delivery validate --json
`;
