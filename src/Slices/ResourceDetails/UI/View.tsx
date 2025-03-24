import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";
import { useGetResourceDetails } from "@/Data/Managers/V2/Resource";
import {
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

export const View: React.FC<Props> = ({ id }) => {
  const [activeTab, setActiveTab] = useUrlStateWithString<TabKey>({
    default: TabKey.Attributes,
    key: `tab`,
    route: "ResourceDetails",
  });

  const { data, isSuccess, isError, error, refetch } =
    useGetResourceDetails().useContinuous(id);

  if (isError) {
    return (
      <PageContainer pageTitle={words("resources.details.title")}>
        <ErrorView
          message={error.message}
          aria-label="ResourceDetails-Error"
          retry={refetch}
        />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("resources.details.title")}>
        <Flex>
          <FlexItem>
            <Description>{id}</Description>
          </FlexItem>
          <FlexItem>
            <ResourceStatusLabel
              status={labelColorConfig[data.status]}
              label={data.status}
            />
          </FlexItem>
        </Flex>

        <Tabs {...{ id, data, activeTab, setActiveTab }} />
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("resources.details.title")}>
      <LoadingView aria-label="ResourceDetails-Loading" />;{" "}
    </PageContainer>
  );
};
