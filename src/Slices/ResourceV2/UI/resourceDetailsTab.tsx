import React, { useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Query, RemoteData } from "@/Core";
import { useUrlStateWithString } from "@/Data";
import { TabKey, Tabs } from "@/Slices/ResourceDetails/UI/Tabs";
import { DependencyContext, words } from "@/UI";
import {
  Description,
  PageContainer,
  ResourceStatusLabel,
} from "@/UI/Components";

interface ResourceTabsProps {
  resourceId: string;
}

export const ResourceDetailsTab: React.FunctionComponent<ResourceTabsProps> = ({
  resourceId,
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Attributes,
    key: `tab`,
    route: "ResourcesV2",
  });

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
    id: resourceId,
  });
  return (
    <PageContainer title={words("resources.details.title")}>
      <CustomFlex>
        <FlexItem>
          <Description>{resourceId}</Description>
        </FlexItem>
        <FlexItem>
          <StatusLabel {...{ data }} />
        </FlexItem>
      </CustomFlex>

      <Tabs {...{ id: resourceId, data, activeTab, setActiveTab }} />
    </PageContainer>
  );
};

const CustomFlex = styled(Flex)`
  margin-bottom: 16px;
`;

const StatusLabel: React.FC<{
  data: Query.UsedApiData<"GetResourceDetails">;
}> = ({ data }) => {
  if (!RemoteData.isSuccess(data)) return null;
  return <ResourceStatusLabel status={data.value.status} />;
};
