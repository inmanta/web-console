import React, { useEffect, useState } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { useStoreDispatch, useStoreState } from "../Store";
import { RemoteData } from "@/Core";
import {
  ResourceTable,
  HrefCreatorImpl,
  LoadingResourceTable,
  FailedResourceTable,
} from "@/UI/Components";
import { words } from "@/UI/words";

interface Props extends TabProps {
  id: string;
  entity: string;
  version: string;
  environment: string;
}

export const ResourcesView: React.FC<Props> = ({
  id,
  entity,
  version,
  environment,
}) => {
  const dispatch = useStoreDispatch();
  const resources = useStoreState((store) =>
    store.resources.resourcesOfInstance(id)
  );
  const [result, setResult] = useState<RemoteData.Type<string, unknown>>(
    RemoteData.notAsked()
  );

  useEffect(() => {
    const fetchResources = async () => {
      setResult(
        await dispatch.resources.fetchResources({
          id,
          serviceEntity: entity,
          version,
          environment,
        })
      );
    };
    setResult(RemoteData.loading());
    fetchResources();
  }, []);

  const caption = words("inventory.resourcesTable.caption")(id);

  return RemoteData.fold<string, unknown, JSX.Element | null>({
    notAsked: () => null,
    loading: () => <LoadingResourceTable caption={caption} />,
    failed: (error) => <FailedResourceTable caption={caption} error={error} />,
    success: () => (
      <ResourceTable
        caption={caption}
        hrefCreator={new HrefCreatorImpl(environment)}
        resources={resources}
      />
    ),
  })(result);
};
