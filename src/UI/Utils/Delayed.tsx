import React, { useEffect, useState } from "react";

interface Props {
  delay?: number;
}

export const Delayed: React.FC<React.PropsWithChildren<Props>> = ({
  delay,
  children,
}) => {
  const [visible, setVisible] = useState(!Boolean(delay));

  useEffect(() => {
    if (!delay) return undefined;
    const timerId = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timerId);
  }, [delay]);

  return visible ? <>{children}</> : null;
};
