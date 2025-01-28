import React, { useContext, useEffect, useState } from "react";
import { Banner, Button, Flex, Spinner } from "@patternfly/react-core";
import { useUpdateEnvConfig } from "@/Data/Managers/V2/POST/UpdateEnvConfig";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ToastAlert } from "../ToastAlert";

/**
 * A React component that displays a banner when the expert mode is enabled.
 *
 * @props {object} props - The properties passed to the component.
 * @returns { React.FC<Props> | null} The rendered banner if the expert mode is enabled, otherwise null.
 */
export const ExpertBanner: React.FC = () => {
  const [errorMessage, setMessage] = useState<string | undefined>(undefined);
  const { environmentModifier } = useContext(DependencyContext);
  const { mutate, isError, error } = useUpdateEnvConfig();
  const [isLoading, setIsLoading] = useState(false); // isLoading is to indicate the asynchronous operation is in progress, as we need to wait until setting will be updated, getters are still in the V1 - task https://github.com/inmanta/web-console/issues/5999

  useEffect(() => {
    if (isError) {
      setMessage(error.message);
      setIsLoading(false);
    }
  }, [isError, error]);

  return environmentModifier.useIsExpertModeEnabled() ? (
    <>
      {isError && errorMessage && (
        <ToastAlert
          data-testid="ToastAlert"
          title={words("error")}
          message={errorMessage}
          setMessage={setMessage}
        />
      )}
      <Banner
        isSticky
        color="red"
        id="expert-mode-banner"
        aria-label="expertModeActive"
      >
        <Flex
          justifyContent={{ default: "justifyContentCenter" }}
          gap={{ default: "gapXs" }}
        >
          {words("banner.expertMode")}
          <Button
            variant="link"
            isInline
            onClick={() => {
              setIsLoading(true);
              mutate({ id: "enable_lsm_expert_mode", value: false });
            }}
          >
            {words("banner.disableExpertMode")}
          </Button>
          {isLoading && <Spinner isInline size="sm" />}
        </Flex>
      </Banner>
    </>
  ) : null;
};
