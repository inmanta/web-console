import React, { useEffect, useState, ReactElement } from "react";
import { useParams } from "react-router-dom";
import { RemoteData, InventoryResponse } from "Core";
import { DataManager } from "Infrastructure";
import { TableProvider } from "./TableProvider";

interface Params {
  id: string;
}

interface Props {
  dataManager: DataManager;
}

export const DataProvider: React.FC<Props> = ({ dataManager }) => {
  const { id } = useParams<Params>();
  const [data, setData] = useState<RemoteData.Type<string, InventoryResponse>>(
    RemoteData.notAsked()
  );

  useEffect(() => {
    (async () => {
      const data = await dataManager.getInstancesForService("fakeEnvId", id);
      setData(RemoteData.fromEither(data));
    })();
  });

  return RemoteData.fold<string, InventoryResponse, ReactElement>({
    notAsked: () => <p>not asked</p>,
    loading: () => <p>loading</p>,
    failed: (error) => <p>error: {error}</p>,
    success: (response) => <TableProvider instances={response.data} />,
  })(data);
};
