import React, { useContext } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import {
  RemoteData,
  ResourceModel,
  VersionedServiceInstanceIdentifier,
} from "@/Core";
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
  qualifier: VersionedServiceInstanceIdentifier;
}

export const ResourcesView: React.FC<Props> = ({ qualifier }) => {
  const { dataProvider } = useContext(ServicesContext);

  const [data] = dataProvider.useContinuous<"Resources">({
    kind: "Resources",
    qualifier,
  });

  return RemoteData.fold<string, ResourceModel[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => (
      <FillerResourceTable
        filler={<LoadingFiller delay={500} />}
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
