import React, { useContext } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { Query, RemoteData, ResourceModel } from "@/Core";
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
  qualifier: Query.ResourcesQualifier;
}

export const ResourcesView: React.FC<Props> = ({ qualifier }) => {
  const { dataManager } = useContext(ServicesContext);

  dataManager.useSubscription({ kind: "Resources", qualifier });
  const data = dataManager.useData({ kind: "Resources", qualifier });

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
