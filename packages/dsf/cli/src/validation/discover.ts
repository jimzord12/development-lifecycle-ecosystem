import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

import type { Finding } from './types.js';

export function discoverDeliveryRoot(
  cwd: string,
): { ok: true; deliveryRoot: string } | { ok: false; findings: Finding[] } {
  const deliveryRoot = join(cwd, 'delivery');
  if (!existsSync(deliveryRoot) || !statSync(deliveryRoot).isDirectory()) {
    return {
      ok: false,
      findings: [
        {
          kind: 'discovery',
          artifact: 'delivery',
          path: '/',
          code: 'DEFINITION_NOT_FOUND',
          message:
            'No delivery/ directory was found in the process working directory.',
        },
      ],
    };
  }
  return { ok: true, deliveryRoot };
}
