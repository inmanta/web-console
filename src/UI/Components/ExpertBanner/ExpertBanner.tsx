import React, { useEffect, useState } from "react";
import { Banner } from "@patternfly/react-core";

export interface CustomEvent extends Event {
  detail?: boolean;
}
export const ExpertBanner = () => {
  const [showBannerState, setShowBannerState] = useState(false);
  useEffect(() => {
    document.addEventListener("expert-mode-check", (evt: CustomEvent) => {
      setShowBannerState(evt.detail ? true : false);
    });
    return () =>
      document.removeEventListener("expert-mode-check", (evt: CustomEvent) => {
        setShowBannerState(evt.detail ? true : false);
      });
  }, []);
  const banner = (
    <React.Fragment>
      <Banner isSticky variant="danger">
        LSM expert mode is enabled, proceed with caution.
      </Banner>
    </React.Fragment>
  );

  return showBannerState ? banner : null;
};
