import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { Button } from "@patternfly/react-core";
import { graphql } from "@/Data/Apollo/gql";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { words } from "@/UI/words";

/**
 * Sets all statuses of a resource to green (successful, compliant, not blocked) or red (failed, undefined, blocked). The mutation is resolved in the browser and returns
 * the changed resource, which Apollo writes into the cache, so only that row updates and nothing is refetched.
 */
export const SET_RESOURCE_HEALTH = graphql(`
  mutation SetResourceHealth($resourceId: String!, $healthy: Boolean!) {
    setResourceHealth(resourceId: $resourceId, healthy: $healthy) @client {
      resourceId
      state {
        resourceId
        lastHandlerRun
        compliance
        blocked
        isDeploying
      }
    }
  }
`);

/**
 * Demo button that toggles the statuses of one resource between all red and all green through a local mutation.
 * Shows a success toast with the resource from the mutation result.
 *
 * @prop {string | undefined} resourceId - The resource to change, undefined while there is none to change.
 *
 * @example
 * <ResourceHealthDemoButton resourceId={page?.resources[0]?.resourceId} />
 */
export const ResourceHealthDemoButton: React.FC<{ resourceId: string | undefined }> = ({
  resourceId,
}) => {
  const [nextHealthy, setNextHealthy] = useState(false);
  const [setResourceHealth, { loading }] = useMutation(SET_RESOURCE_HEALTH);
  const { notifySuccess } = useAppAlert();

  const onClick = async () => {
    if (!resourceId) {
      return;
    }

    const { data } = await setResourceHealth({ variables: { resourceId, healthy: nextHealthy } });

    if (data) {
      notifySuccess({
        title: words("resources.demoMutation.success")(
          data.setResourceHealth.resourceId,
          nextHealthy
        ),
      });
    }
    setNextHealthy(!nextHealthy);
  };

  return (
    <Button variant="secondary" onClick={onClick} isDisabled={!resourceId} isLoading={loading}>
      {nextHealthy
        ? words("resources.demoMutation.markHealthy")
        : words("resources.demoMutation.markFailing")}
    </Button>
  );
};
