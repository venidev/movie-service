import type { ReactNode } from 'react';

export default function Notice({ error = false, children }: { error?: boolean; children: ReactNode }) {
  return error ? (
    <p className="notice notice-error" role="alert">{children}</p>
  ) : (
    <p className="notice">{children}</p>
  );
}
