import React from "react";
import { BackgroundImage } from "@patternfly/react-core";
import lg from "@patternfly/react-core/dist/styles/assets/images/pfbg_2000.jpg";

export const SimpleBackgroundImage: React.FC<{ className?: string }> = ({
  className,
}) => <BackgroundImage src={lg} alt="Background image" className={className} />;
