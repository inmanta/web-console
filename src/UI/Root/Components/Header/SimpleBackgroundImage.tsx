import React from "react";
import { BackgroundImage } from "@patternfly/react-core";
import lg from "@patternfly/react-core/dist/styles/assets/images/pfbg_2000.jpg";
import xs from "@patternfly/react-core/dist/styles/assets/images/pfbg_576.jpg";
import xs2x from "@patternfly/react-core/dist/styles/assets/images/pfbg_576@2x.jpg";
import sm from "@patternfly/react-core/dist/styles/assets/images/pfbg_768.jpg";
import sm2x from "@patternfly/react-core/dist/styles/assets/images/pfbg_768@2x.jpg";

export const SimpleBackgroundImage: React.FC<{ className?: string }> = ({
  className,
}) => (
  <BackgroundImage
    src={{
      lg,
      sm,
      sm2x,
      xs,
      xs2x,
    }}
    alt="Background image"
    className={className}
  />
);
