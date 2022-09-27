import React, { useContext } from "react";
import { Banner } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";

export const UpdateBanner: React.FunctionComponent = () => {
  const cachedVersion = window.localStorage.getItem("orchestrator_version");

  console.log(cachedVersion);

  const { featureManager } = useContext(DependencyContext);

  console.log(featureManager.getServerVersion());

  const banner = (
    <React.Fragment>
      <Banner
        isSticky
        className="pointer"
        variant="warning"
        onClick={() => {
          window.location.reload();
        }}
      >
        Click here to update your application, a new version is available!
      </Banner>
    </React.Fragment>
  );

  return cachedVersion ? null : banner;
};
