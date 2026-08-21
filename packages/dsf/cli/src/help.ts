export const TOP_LEVEL_HELP = `delivery — Delivery CLI for the Delivery System Framework (DSF)

A non-interactive, optional companion CLI. It validates Delivery Definitions
and, when the CLI profile is adopted, operates CLI-owned execution state.
It is not a source of design truth.

USAGE
  delivery [--json] --help
  delivery [--json] --version
  delivery [--json] validate
  delivery [--json] docs [<topic>] [--index|-i] [--all|-a]

OPTIONS
  -h, --help     Print help and exit 0. No prompt. No pager.
  --version      Print CLI identity (name, version, owning DSF, DLE CLI Standard).
  --json         Machine-readable JSON only: one UTF-8 document plus a newline.

COMMANDS
  validate       Read-only validation. No repair and no mutation.
  docs           Read-only documentation retrieval. Compact index by default.

DEFAULTS
  Output is human-readable unless --json is passed.
  The CLI never prompts and never reads stdin unless a later documented option says so.
  This bootstrap recognizes no environment variables and no config file.

SIDE EFFECTS
  --help, --version, validate, and docs do not write files or mutate Git.

EXAMPLES
  delivery --help
  delivery validate --help
  delivery --version --json
  delivery validate --json
  delivery docs
  delivery docs --index
  delivery docs validation
  delivery docs validation --all
  delivery docs --all
  delivery docs validation --json

EXIT CODES
  0    success
  !=0  failure. Automation should branch on JSON error.code, not the numeric code.

This CLI implements the DLE CLI Standard V1 universal surface.
Delivery domain commands are not implemented yet.
`;

export const VALIDATE_HELP = `delivery validate — read-only Delivery Definition validation

USAGE
  delivery [--json] validate

ARGUMENTS
  none. The Delivery Definition is discovered at <cwd>/delivery/.

OPTIONS
  -h, --help     Print this help and exit 0.
  --json         Machine-readable JSON only: one UTF-8 document plus a newline.

DEFAULTS
  Human-readable output unless --json is passed.
  Discovery uses the process working directory. There is no --root or --cwd flag.

SIDE EFFECTS
  None. validate never repairs, writes, creates .cli state, or mutates Git.

BEHAVIOR
  Validates Delivery Definition schema v2 structurally, then checks DSF graph
  invariants. Operational eligibility (start/accept/baseline) is out of scope.
  Unsupported schema versions fail closed with COMPATIBILITY_UNSUPPORTED.

EXAMPLES
  delivery validate --help
  delivery validate --json
`;

export const DOCS_HELP = `delivery docs — read-only documentation retrieval

USAGE
  delivery [--json] docs [<topic>] [--index|-i | --all|-a]

ARGUMENTS
  <topic>        Optional canonical topic id. Lowercase dot-separated exact match.
                 Invalid ids are not normalized. Unknown ids fail closed.

OPTIONS
  -h, --help     Print this help and exit 0.
  -i, --index    Compact topic map. No documentation bodies.
  -a, --all      Return every topic body in the current documentation scope.
  --json         Machine-readable JSON only: one UTF-8 document plus a newline.

DEFAULTS
  Human-readable output unless --json is passed.
  docs with no topic and no mode flag is equivalent to docs --index.
  --all is scope-aware: with a topic it returns that topic and every descendant.
  There is no --recursive flag. -idx is not an alias for --index.

SIDE EFFECTS
  None. docs never writes files, mutates Definition or .cli state, or uses the network.

BEHAVIOR
  Help explains invocation. docs explains the Delivery mental model.
  Lookup is exact. --index and --all cannot be combined.
  Documentation ships inside the CLI package and is cwd-independent.

EXAMPLES
  delivery docs
  delivery docs --index
  delivery docs validation
  delivery docs validation --index
  delivery docs validation --all
  delivery docs --all
  delivery docs validation --json
`;
