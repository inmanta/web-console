import { CSSProperties } from "react";
import "./DeployingDot.css";

interface DeployingDotProps {
  size?: number;
  color?: string;
  interval?: number;
}

export const DeployingDot: React.FC<DeployingDotProps> = ({
  size = 10,
  color = "var(--pf-t--color--blue--30)",
  interval = 5000,
}) => {
  const sizeRem = size / 16;

  const style: CSSProperties = {
    width: `${sizeRem}rem`,
    height: `${sizeRem}rem`,
    backgroundColor: color,
    animationDuration: `${interval}ms`,
  };

  return <span className="deploying-dot" style={style} />;
};
