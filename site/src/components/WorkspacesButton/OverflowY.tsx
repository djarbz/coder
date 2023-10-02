import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  height?: number;
  maxHeight?: number;
  minHeight?: number;
};

export function OverflowY({
  children,
  height = 400,
  minHeight = height,
  maxHeight = height,
}: Props) {
  // Component should only reference min/max heights in implementation
  return (
    <div style={{ height: `${height}px`, overflowY: "auto" }}>{children}</div>
  );
}
