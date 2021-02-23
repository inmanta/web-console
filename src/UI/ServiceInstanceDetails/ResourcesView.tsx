import React, { useContext } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { RemoteData, ResourceModel, ServiceInstanceIdentifier } from "@/Core";
import {
  ResourceTable,
  HrefCreatorImpl,
  FillerResourceTable,
  LoadingFiller,
  FailedFiller,
  EmptyFiller,
} from "@/UI/Components";
import { ServicesContext } from "@/UI/ServicesContext";

interface Props extends TabProps {
  qualifier: ServiceInstanceIdentifier;
}

export const ResourcesView: React.FC<Props> = ({ qualifier }) => {
  const { dataProvider } = useContext(ServicesContext);

  dataProvider.useSubscription({ kind: "Resources", qualifier });
  const data = dataProvider.useData<"Resources">({
    kind: "Resources",
    qualifier,
  });

  return RemoteData.fold<string, ResourceModel[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => (
      <FillerResourceTable
        filler={<LoadingFiller />}
        aria-label="ResourceTable-Loading"
      />
    ),
    failed: (error) => (
      <FillerResourceTable
        filler={<FailedFiller error={error} />}
        aria-label="ResourceTable-Failed"
      />
    ),
    success: (resources) =>
      resources.length === 0 ? (
        <FillerResourceTable
          filler={<EmptyFiller />}
          aria-label="ResourceTable-Empty"
        />
      ) : (
        <ResourceTable
          hrefCreator={new HrefCreatorImpl(qualifier.environment)}
          resources={resources}
          aria-label="ResourceTable-Success"
        />
      ),
  })(data);
};
