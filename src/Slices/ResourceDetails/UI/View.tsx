import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { Resource } from "@/Core/Domain";
import { useUrlStateWithString } from "@/Data";
import { ResourceActionFilter, useGetResourceDetails } from "@/Data/Queries";
import {
  DeployActions,
  Description,
  ErrorView,
  labelColorConfig,
  LoadingView,
  PageContainer,
  ResourceStatusLabel,
} from "@/UI/Components";
import { words } from "@/UI/words";
import { TabKey, Tabs } from "./Tabs";

interface Props {
  id: string;
}

/**
 * The View component.
 *
 * This component is responsible of displaying the resource details.
 *
 * @Props {Props} - The props of the component
 *  @prop {string} id - The id of the resource
 *
 * @returns {React.FC<Props>} A React Component displaying the resource details
 */
export const View: React.FC<Props> = ({ id }) => {
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Attributes,
    key: "tab",
    route: "ResourceDetails",
  });

  const { data, isSuccess, isError, error, refetch } = useGetResourceDetails().useContinuous(id);

  if (isError) {
    return (
      <PageContainer pageTitle={words("resources.details.title")}>
        <ErrorView message={error.message} ariaLabel="ResourceDetails-Error" retry={refetch} />
      </PageContainer>
    );
  }

  if (isSuccess) {
    // A single resource is a filter of one: pin its identity (type/agent/value) on the latest
    // released intent, so deploy and repair act on exactly this resource.
    const resourceFilter: ResourceActionFilter = {
      isOrphan: false,
      resourceType: { eq: [data.resource_type] },
      agent: { eq: [data.agent] },
      resourceIdValue: { eq: [data.id_attribute_value] },
    };

    return (
      <PageContainer
        pageTitle={words("resources.details.title")}
        aria-label="ResourceDetails-Success"
        actions={
          <DeployActions
            filter={resourceFilter}
            disabledReason={
              Resource.isOrphanedStatus(data.status)
                ? words("resources.deployActions.orphaned.disabled")
                : undefined
            }
          />
        }
      >
        <Flex>
          <FlexItem aria-label={`resourceName-${id}`}>
            <Description>{id}</Description>
          </FlexItem>
          <FlexItem>
            <ResourceStatusLabel status={labelColorConfig[data.status]} label={data.status} />
          </FlexItem>
        </Flex>
        <Tabs {...{ id, data, activeTab, setActiveTab }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("resources.details.title")}>
      <LoadingView ariaLabel="ResourceDetails-Loading" />;{" "}
    </PageContainer>
  );
};
