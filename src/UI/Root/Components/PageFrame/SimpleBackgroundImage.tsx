import React from "react";
import { BackgroundImage } from "@patternfly/react-core";

export const SimpleBackgroundImage: React.FC = () => (
  <BackgroundImage
    src={{
      lg: `pfbg_2000.jpg`,
      sm: `pfbg_768.jpg`,
      sm2x: `pfbg_768@2x.jpg`,
      xs: `pfbg_576.jpg`,
      xs2x: `pfbg_576@2x.jpg`,
    }}
    alt="Background image"
  />
);
