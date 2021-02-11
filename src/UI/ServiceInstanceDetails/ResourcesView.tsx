import React, { useContext } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { ResourcesQuery, RemoteData, ResourceModel } from "@/Core";
import {
  ResourceTable,
  HrefCreatorImpl,
  FillerResourceTable,
  LoadingFiller,
  FailedFiller,
  EmptyFiller,
} from "@/UI/Components";
import { ServicesContext } from "../ServicesContext";

interface Props extends TabProps {
  instance: ResourcesQuery;
}

export const ResourcesView: React.FC<Props> = ({ instance }) => {
  const { dataManager } = useContext(ServicesContext);

  dataManager.useSubscription({ kind: "Resources", query: instance });
  const data = dataManager.useData({ kind: "Resources", query: instance });

  return RemoteData.fold<string, ResourceModel[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => <FillerResourceTable filler={<LoadingFiller />} />,
    failed: (error) => (
      <FillerResourceTable filler={<FailedFiller error={error} />} />
    ),
    success: (resources) =>
      resources.length === 0 ? (
        <FillerResourceTable filler={<EmptyFiller />} />
      ) : (
        <ResourceTable
          hrefCreator={new HrefCreatorImpl(instance.environment)}
          resources={resources}
        />
      ),
  })(data);
};
