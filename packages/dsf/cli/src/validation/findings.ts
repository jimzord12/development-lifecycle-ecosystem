import type { Finding } from './types.js';

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((left, right) => {
    return (
      left.artifact.localeCompare(right.artifact) ||
      left.kind.localeCompare(right.kind) ||
      left.path.localeCompare(right.path) ||
      left.code.localeCompare(right.code) ||
      left.message.localeCompare(right.message)
    );
  });
}

export function jsonPointer(segments: Array<string | number>): string {
  if (segments.length === 0) {
    return '/';
  }
  return `/${segments
    .map((segment) =>
      String(segment).replaceAll('~', '~0').replaceAll('/', '~1'),
    )
    .join('/')}`;
}
