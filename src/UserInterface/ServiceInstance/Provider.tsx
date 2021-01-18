import React, { useEffect, useState, ReactElement } from "react";
import { useParams } from "react-router-dom";
import { RemoteData } from "@app/Core";
import { View } from "./View";
import { Response } from "./Response";
import { DataManager } from "./DataManager";

interface Params {
  id: string;
}

interface Props {
  dataManager: DataManager;
}

export const Provider: React.FC<Props> = ({ dataManager }) => {
  const { id } = useParams<Params>();
  const [data, setData] = useState<RemoteData.Type<string, Response>>(
    RemoteData.notAsked()
  );

  useEffect(() => {
    (async () => {
      const data = await dataManager.getInstancesForService(id);
      setData(RemoteData.fromEither(data));
    })();
  });

  return RemoteData.fold<string, Response, ReactElement>({
    notAsked: () => <p>not asked</p>,
    loading: () => <p>loading</p>,
    failed: (error) => <p>error: {error}</p>,
    success: (response) => <View instances={response.data} />,
  })(data);
};
