import React from "react";

interface Props {
  level: number;
  noToggle?: boolean;
}

export const Indent: React.FC<React.PropsWithChildren<Props>> = ({
  level,
  children,
  noToggle,
}) => {
  const space = level * 16 + (noToggle ? 48 : 0);
  return <span style={{ marginLeft: `${space}px` }}>{children}</span>;
};
