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
import { words } from "@/UI/words";
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

  const caption = words("inventory.resourcesTable.caption")(instance.id);

  return RemoteData.fold<string, ResourceModel[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => (
      <FillerResourceTable caption={caption} filler={<LoadingFiller />} />
    ),
    failed: (error) => (
      <FillerResourceTable
        caption={caption}
        filler={<FailedFiller error={error} />}
      />
    ),
    success: (resources) =>
      resources.length === 0 ? (
        <FillerResourceTable caption={caption} filler={<EmptyFiller />} />
      ) : (
        <ResourceTable
          caption={caption}
          hrefCreator={new HrefCreatorImpl(instance.environment)}
          resources={resources}
        />
      ),
  })(result);
};
