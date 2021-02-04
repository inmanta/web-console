import React, { useContext, useEffect, useState } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { InstanceForResources, RemoteData, ResourceModel } from "@/Core";
import {
  ResourceTable,
  HrefCreatorImpl,
  LoadingResourceTable,
  FailedResourceTable,
  EmptyResourceTable,
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
  >(RemoteData.notAsked());

  useEffect(() => {
    const fetchResources = async () => {
      setResult(
        RemoteData.fromEither(await resourceFetcher.getResources(instance))
      );
    };
    setResult(RemoteData.loading());
    fetchResources();
  }, []);

  const caption = words("inventory.resourcesTable.caption")(instance.id);

  return RemoteData.fold<string, ResourceModel[], JSX.Element | null>({
    notAsked: () => null,
    loading: () => <LoadingResourceTable caption={caption} />,
    failed: (error) => <FailedResourceTable caption={caption} error={error} />,
    success: (resources) =>
      resources.length === 0 ? (
        <EmptyResourceTable caption={caption} />
      ) : (
        <ResourceTable
          caption={caption}
          hrefCreator={new HrefCreatorImpl(instance.environment)}
          resources={resources}
        />
      ),
  })(result);
};
