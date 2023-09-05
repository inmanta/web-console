import React, { useContext } from "react";
import { Banner } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";

export const ExpertBanner = () => {
  const { environmentModifier } = useContext(DependencyContext);

  return environmentModifier.useIsExpertModeEnabled() ? (
    <React.Fragment>
      <Banner isSticky variant="red" id="expert-mode-banner">
        LSM expert mode is enabled, proceed with caution.
      </Banner>
    </React.Fragment>
  ) : null;
};
