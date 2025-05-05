import React, { useContext, useEffect, useState } from "react";
import { Banner, Flex } from "@patternfly/react-core";
import { useGetVersionFileInfo } from "@/Data/Managers/V2/Miscellaneous";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

/**
 * Component for displaying an update banner when a new version is available.
 *
 * @returns {React.ReactNode} The rendered component.
 */
export const UpdateBanner: React.FC = () => {
  const { featureManager } = useContext(DependencyContext);
  const [showBannerState, setShowBannerState] = useState(false);
  const currentVersion = featureManager.getAppVersion();
  const currentCommit = featureManager.getCommitHash();
  const { data, isSuccess } = useGetVersionFileInfo();

  useEffect(() => {
    if (isSuccess && data.version_info.commitHash !== currentCommit) {
      setShowBannerState(true);
    }
  }, [isSuccess, currentCommit, data]);

  const banner = (
    <React.Fragment>
      <Banner isSticky color="yellow" aria-label="newVersionAvailable">
        <Flex justifyContent={{ default: "justifyContentCenter" }}>
          {words("banner.updateBanner")(currentVersion)}
        </Flex>
      </Banner>
    </React.Fragment>
  );

  return showBannerState ? banner : null;
};
