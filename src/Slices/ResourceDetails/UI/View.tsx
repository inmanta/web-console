import React, { useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Query, RemoteData } from "@/Core";
import { useUrlStateWithString } from "@/Data";
import {
  Description,
  PageContainer,
  ResourceStatusLabel,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { TabKey, Tabs } from "./Tabs";

interface Props {
  id: string;
}

export const View: React.FC<Props> = ({ id }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Attributes,
    key: `tab`,
    route: "ResourceDetails",
  });

  const [data] = queryResolver.useContinuous<"GetResourceDetails">({
    kind: "GetResourceDetails",
    id,
  });

  return (
    <PageContainer title={words("resources.details.title")}>
      <CustomFlex>
        <FlexItem>
          <Description>{id}</Description>
        </FlexItem>
        <FlexItem>
          <StatusLabel {...{ data }} />
        </FlexItem>
      </CustomFlex>

      <Tabs {...{ id, data, activeTab, setActiveTab }} />
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
