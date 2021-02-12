import React, { useContext } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { ResourcesQualifier, RemoteData, ResourceModel } from "@/Core";
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
  qualifier: ResourcesQualifier;
}

export const ResourcesView: React.FC<Props> = ({ qualifier }) => {
  const { dataManager } = useContext(ServicesContext);

  dataManager.useSubscription({ kind: "Resources", qualifier });
  const data = dataManager.useData({ kind: "Resources", qualifier });

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
          hrefCreator={new HrefCreatorImpl(qualifier.environment)}
          resources={resources}
        />
      ),
  })(data);
};
