import React from 'react';

/** Internal: count the rendered children (fragments flattened, null and false skipped). */
export function countFields(children: React.ReactNode): number {
  let n = 0;
  React.Children.forEach(children, (c) => {
    if (React.isValidElement(c) && c.type === React.Fragment) n += countFields((c.props as { children?: React.ReactNode }).children);
    else if (c !== null && c !== undefined && typeof c !== 'boolean') n++;
  });
  return n;
}

export const clampColumns = (n: number) => Math.max(1, Math.min(6, Math.round(n) || 1));
