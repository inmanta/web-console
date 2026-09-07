import React, { useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";
import { words } from "@/UI";
import { ResourceActions } from "@/UI/Components";
import { InstanceDetailsContext } from "../../../Core/Context";
import { buildInstanceResourceActionScopes } from "../../../Core/resourceActionScopes";
import { InstanceActions } from "../InstanceActions";

/**
 * The Service Instance Details header actions: the Deploy/Repair split button (scoped to this
 * instance, plus its owned services when the catalog offers them) and the InstanceActions menu.
 * Rendered only on the latest version; requires the ServiceInstanceDetails context.
 */
export const InstanceHeaderActions: React.FC = () => {
  const { instance, serviceModelQuery } = useContext(InstanceDetailsContext);

  const [selectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: "version",
    route: "InstanceDetails",
  });

  const isLatest = selectedVersion === String(instance.version);

  if (!isLatest) {
    return null;
  }

  const total = instance.deployment_progress?.total;
  const ownedEntities = serviceModelQuery.data?.owned_entities ?? [];

  const scopes = buildInstanceResourceActionScopes({
    instanceId: instance.id,
    total,
    ownedEntities,
  });

  // A null total is unknown, not zero, so only an explicit zero counts as "no resources".
  const hasNoResources = total != null && Number(total) === 0;
  // Disable only when there is nothing to act on: no resources and no owned services.
  const hasNothingToDeploy = ownedEntities.length === 0 && hasNoResources;

  // Reasons are checked in priority order: the first one that applies wins.
  const resolveDisabledReason = (): string | undefined => {
    if (instance.deleted) {
      return words("resources.resourceActions.instance.deleted.disabled");
    }
    if (serviceModelQuery.isLoading) {
      return words("resources.resourceActions.catalog.loading");
    }
    if (serviceModelQuery.isError) {
      return words("resources.resourceActions.catalog.error");
    }
    if (hasNothingToDeploy) {
      return words("resources.resourceActions.instance.empty.disabled");
    }

    return undefined;
  };

  const disabledReason = resolveDisabledReason();

  return (
    <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapMd" }}>
      <FlexItem>
        <ResourceActions scopes={scopes} disabledReason={disabledReason} />
      </FlexItem>
      <FlexItem>
        <InstanceActions />
      </FlexItem>
    </Flex>
  );
};
