import React from "react";
import { Banner, Button, Flex } from "@patternfly/react-core";
import { useReducedAnimations } from "@/UI/Components/ReducedAnimations/useReducedAnimations";
import { words } from "@/UI/words";

/** Number of concurrently-deploying resources above which the banner offers to reduce animations. */
export const MANY_DEPLOYING_THRESHOLD = 50;

/**
 * Number of concurrently-deploying resources at or below which, once animations were
 * reduced, the banner offers to turn them back on again.
 */
export const NORMAL_DEPLOYING_THRESHOLD = 10;

interface Props {
  deployingCount: number;
}

/**
 * Bottom banner shown on the Resources page when many resources are deploying at once,
 * or, once the user has reduced animations, again once deploy load is back to normal.
 * Lets the user opt in/out of rendering the deploying indicators statically instead of
 * animated, for those impacted by the CPU cost of many concurrent CSS animations.
 */
export const DeployingAnimationBanner: React.FC<Props> = ({ deployingCount }) => {
  const { reducedAnimations, setReducedAnimations } = useReducedAnimations();

  if (reducedAnimations) {
    if (deployingCount > NORMAL_DEPLOYING_THRESHOLD) {
      return null;
    }

    return (
      <Banner color="blue" id="deploying-animation-banner" aria-label="deployingLoadBackToNormal">
        <Flex justifyContent={{ default: "justifyContentCenter" }} gap={{ default: "gapXs" }}>
          {words("resources.banner.backToNormal")}
          <Button variant="link" isInline onClick={() => setReducedAnimations(false)}>
            {words("resources.banner.enableAnimations")}
          </Button>
        </Flex>
      </Banner>
    );
  }

  if (deployingCount < MANY_DEPLOYING_THRESHOLD) {
    return null;
  }

  return (
    <Banner color="blue" id="deploying-animation-banner" aria-label="manyResourcesDeploying">
      <Flex justifyContent={{ default: "justifyContentCenter" }} gap={{ default: "gapXs" }}>
        {words("resources.banner.manyDeploying")(deployingCount)}
        <Button variant="link" isInline onClick={() => setReducedAnimations(true)}>
          {words("resources.banner.disableAnimations")}
        </Button>
      </Flex>
    </Banner>
  );
};
