import React, { useContext } from "react";
import { Diff } from "@/Core";
import {
  PageContainer,
  RemoteDataView,
  DiffWizard,
  DiffGroupInfo,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";

export const Page: React.FC = () => {
  const { from, to } = useRouteParams<"DesiredStateCompare">();
  const { queryResolver } = useContext(DependencyContext);

  const [data] = queryResolver.useOneTime<"GetDesiredStateDiff">({
    kind: "GetDesiredStateDiff",
    from,
    to,
  });

  console.log({ from, to, data });

  return (
    <PageContainer title={words("desiredState.compare.title")}>
      <RemoteDataView
        data={data}
        label="CompareView"
        SuccessView={(resources) => (
          <DiffWizard
            groups={resources.map(resourceToDiffGroup)}
            source={from}
            target={to}
          />
        )}
      />
    </PageContainer>
  );
};

const resourceToDiffGroup = (resource: Diff.Resource): DiffGroupInfo => {
  return {
    id: resource.resource_id,
    status: resource.status,
    entries: Object.entries(resource.attributes).map(([key, value]) => ({
      title: key,
      source: value.from_value_compare,
      target: value.to_value_compare,
    })),
  };
};
