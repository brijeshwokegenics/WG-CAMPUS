import React from 'react';

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is intentionally minimal. It passes through children without any
  // dashboard chrome (sidebars, headers, etc.) to ensure clean printing.
  return <>{children}</>;
}
