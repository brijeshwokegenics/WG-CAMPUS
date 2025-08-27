import React from 'react';

// This layout is intentionally minimal. It passes through children without any
// dashboard chrome (sidebars, headers, etc.) to ensure clean printing.
export default function FeeReceiptPrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
