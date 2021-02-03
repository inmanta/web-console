import React, { useEffect, useState } from "react";
import { TabProps } from "./ServiceInstanceDetails";
import { useStoreDispatch, useStoreState } from "../Store";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      const error = await dispatch.resources.fetchResources({
        id,
        serviceEntity: entity,
        version,
        environment,
      });
      setError(error);
    };
    fetchResources();
  }, []);

  return (
    <>
      {error && <div>{error}</div>}
      <pre>
        <code>{JSON.stringify(resources, null, 4)}</code>
      </pre>
    </>
  );
};
