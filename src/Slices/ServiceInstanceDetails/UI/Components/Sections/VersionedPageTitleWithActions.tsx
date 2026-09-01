import React, { useContext } from "react";
import { Flex, FlexItem, Label } from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";
import { ResourceActionFilter } from "@/Data/Queries";
import { words } from "@/UI";
import { DeployActions, ScopeOption } from "@/UI/Components";
import { InstanceDetailsContext } from "../../../Core/Context";
import { InstanceActions } from "../InstanceActions";

interface Props {
  title: string;
}

/**
 * The PageTitleWithVersion Component
 *
 * When the version is the latest active version, we don't display a tag.
 * When the version is not the latest active version, we display a tag with the version number.
 * If the instance is deleted, we display a label with the terminated-state.
 *
 * The title section also contains InstanceActions
 *
 * @note This component requires the ServiceInstanceDetails context to exist in one of its parents.
 *
 * @Props {Props} - The props of the component.
 *  @prop {string} title - the title of the page.
 *
 * @returns {React.FC<Props>} A React Component that displays the page title with the correct version tag
 */
export const VersionedPageTitleWithActions: React.FC<Props> = ({ title }) => {
  const { instance, serviceModelQuery } = useContext(InstanceDetailsContext);

  const [selectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: "version",
    route: "InstanceDetails",
  });

  const isLatest = selectedVersion === String(instance.version);

  // Offer the owned scope only when the service type can own another (owned_entities).
  const instanceFilter: ResourceActionFilter = { serviceInstance: [instance.id] };
  const total = instance.deployment_progress?.total;
  const ownedEntities = serviceModelQuery.data?.owned_entities ?? [];

  const scopes: ScopeOption[] = [
    {
      id: "instance",
      title: words("resources.deployActions.confirm.instance.title"),
      filter: instanceFilter,
      detail:
        total == null
          ? undefined
          : words("resources.deployActions.confirm.instance.count")(Number(total)),
    },
    ...(ownedEntities.length > 0
      ? [
          {
            id: "owned",
            title: words("resources.deployActions.confirm.owned.title"),
            filter: { serviceInstance: [instance.id], includeOwned: true },
            detail: words("resources.deployActions.confirm.owned.description")(
              ownedEntities.join(", ")
            ),
          },
        ]
      : []),
  ];

  return (
    <Flex
      justifyContent={{ default: "justifyContentSpaceBetween" }}
      alignItems={{ default: "alignItemsCenter" }}
    >
      <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
        {title}
        {!isLatest && [
          <Label data-testid="selected-version" key="selected-version" color="purple">
            {words("instanceDetails.title.tag")(selectedVersion)}
          </Label>,
        ]}
        {instance.deleted && (
          <Label status="danger" data-testid="terminated" key="terminated">
            {instance.state}
          </Label>
        )}
      </Flex>
      {isLatest && (
        <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapMd" }}>
          <FlexItem>
            <DeployActions
              filter={instanceFilter}
              requireConfirm
              scopes={scopes}
              disabledReason={
                instance.deleted
                  ? words("resources.deployActions.instance.deleted.disabled")
                  : undefined
              }
            />
          </FlexItem>
          <FlexItem>
            <InstanceActions />
          </FlexItem>
        </Flex>
      )}
    </Flex>
  );
};
