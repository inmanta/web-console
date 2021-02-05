import React, { useContext, useEffect, useState } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { InstanceForResources, RemoteData, ResourceModel } from "@/Core";
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
  instance: InstanceForResources;
}

export const ResourcesView: React.FC<Props> = ({ instance }) => {
  const { resourceFetcher } = useContext(ServicesContext);
  const [result, setResult] = useState<
    RemoteData.Type<string, ResourceModel[]>
  >(RemoteData.loading());

  useEffect(() => {
    const fetchResources = async () => {
      setResult(
        RemoteData.fromEither(await resourceFetcher.getResources(instance))
      );
    };
    fetchResources();
  }, []);

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
  })(result);
};
