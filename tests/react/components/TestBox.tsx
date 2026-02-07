import React from "react";

interface TestBoxProps {
  label: string;
  children?: React.ReactNode;
}

export function TestBox({ label, children }: TestBoxProps) {
  return (
    <div className="test-box">
      <span>{label}</span>
      {children}
    </div>
  );
}

export function TestBoxInner({ label }: { label: string }) {
  return (
    <div className="test-box-inner">{label}</div>
  );
}
