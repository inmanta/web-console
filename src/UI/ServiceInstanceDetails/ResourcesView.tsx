import React, { useEffect, useState } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { useStoreDispatch, useStoreState } from "../Store";
import { InstanceForResources, RemoteData } from "@/Core";
import {
  ResourceTable,
  HrefCreatorImpl,
  LoadingResourceTable,
  FailedResourceTable,
  EmptyResourceTable,
} from "@/UI/Components";
import { words } from "@/UI/words";

interface Props extends TabProps {
  instance: InstanceForResources;
}

export const ResourcesView: React.FC<Props> = ({ instance }) => {
  const dispatch = useStoreDispatch();
  const resources = useStoreState((store) =>
    store.resources.resourcesOfInstance(instance.id)
  );
  const [result, setResult] = useState<RemoteData.Type<string, unknown>>(
    RemoteData.notAsked()
  );

  useEffect(() => {
    const fetchResources = async () => {
      setResult(await dispatch.resources.fetchResources({ instance }));
    };
    setResult(RemoteData.loading());
    fetchResources();
  }, []);

  const caption = words("inventory.resourcesTable.caption")(instance.id);

  return RemoteData.fold<string, unknown, JSX.Element | null>({
    notAsked: () => null,
    loading: () => <LoadingResourceTable caption={caption} />,
    failed: (error) => <FailedResourceTable caption={caption} error={error} />,
    success: () =>
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
