import React, { useContext, useEffect, useState } from "react";
import { Banner, Button, Flex, Spinner } from "@patternfly/react-core";
import { useUpdateEnvironmentSetting } from "@/Data/Managers/V2/Environment";
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
  const { environmentModifier } = useContext(DependencyContext);
  const [isLoading, setIsLoading] = useState(false);
  const expertModeEnabled = environmentModifier.useIsExpertModeEnabled();
  const [errorMessage, setMessage] = useState<string | undefined>(undefined);
  const { mutate } = useUpdateEnvironmentSetting({
    onError: (error) => {
      setMessage(error.message);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    setIsLoading(false); //changing it onSuccess doesn't necessarily mean that the expert mode is changed yet, the most reliable way is to check the value of the expert mode directly from the environmentModifier
  }, [expertModeEnabled]);

  return expertModeEnabled ? (
    <>
      {errorMessage && (
        <ToastAlert
          data-testid="ToastAlert"
          title={words("error")}
          message={errorMessage}
          setMessage={setMessage}
        />
      )}
      <Banner isSticky color="red" id="expert-mode-banner" aria-label="expertModeActive">
        <Flex justifyContent={{ default: "justifyContentCenter" }} gap={{ default: "gapXs" }}>
          {words("banner.expertMode")}
          <Button
            variant="link"
            isInline
            onClick={() => {
              setIsLoading(true);
              mutate({
                id: "enable_lsm_expert_mode",
                value: false,
              });
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
