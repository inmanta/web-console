import React, { useContext, useState } from "react";
import { Banner, Flex } from "@patternfly/react-core";
import { ApiHelper } from "@/Core";
import { GetVersionFileQueryManager } from "@/Data/Managers/GetVersionFile/OnteTimeQueryManager";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  apiHelper: ApiHelper;
}

export const UpdateBanner: React.FunctionComponent<Props> = (props) => {
  const { featureManager } = useContext(DependencyContext);
  const [showBannerState, setShowBannerState] = useState(false);
  const currentVersion = featureManager.getAppVersion();
  const currentCommit = featureManager.getCommitHash();

  GetVersionFileQueryManager(props.apiHelper)
    .then(({ kind, value }) => {
      if (kind === "Left" || currentCommit !== value.version_info.commitHash) {
        setShowBannerState(true);
      }
    })
    .catch((error) => console.log(error));

  const banner = (
    <React.Fragment>
      <Banner isSticky variant="gold" aria-label="newVersionAvailable">
        <Flex justifyContent={{ default: "justifyContentCenter" }}>
          {words("banner.updateBanner")(currentVersion)}
        </Flex>
      </Banner>
    </React.Fragment>
  );

  return showBannerState ? banner : null;
};
