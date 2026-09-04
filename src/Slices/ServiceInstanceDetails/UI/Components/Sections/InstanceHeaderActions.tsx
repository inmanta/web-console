import React, { useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";
import { words } from "@/UI";
import { ResourceActions } from "@/UI/Components";
import { InstanceDetailsContext } from "../../../Core/Context";
import { InstanceActions } from "../InstanceActions";
import { buildInstanceResourceActionScopes } from "./resourceActionScopes";

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

  // Nothing to act on: no instance resources and no owned services (an owned scope may hold some).
  const instanceResourceCount = total == null ? 0 : Number(total);
  const hasNothingToDeploy = ownedEntities.length === 0 && instanceResourceCount === 0;

  // Reasons are checked in priority order: the first one that applies wins.
  const resolveDisabledReason = (): string | undefined => {
    if (instance.deleted) {
      return words("resources.resourceActions.instance.deleted.disabled");
    }
    if (serviceModelQuery.isLoading) {
      return words("resources.resourceActions.catalog.loading");
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
