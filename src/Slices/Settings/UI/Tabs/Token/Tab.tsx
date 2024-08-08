import React, { useContext, useState } from "react";
import { ClientType, Either, Maybe, toggleValueInList } from "@/Core";
import { DependencyContext } from "@/UI";
import { TokenForm } from "./TokenForm";

export const Tab: React.FC = () => {
  const { commandResolver } = useContext(DependencyContext);
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<Maybe.Maybe<string>>(Maybe.none());
  const [token, setToken] = useState<Maybe.Maybe<string>>(Maybe.none());
  const trigger = commandResolver.useGetTrigger<"GenerateToken">({
    kind: "GenerateToken",
  });

  const isClientTypeSelected = (clientType: ClientType): boolean =>
    clientTypes.includes(clientType);

  const getClientTypeSelector =
    (clientType: ClientType) => (selected: boolean) => {
      if (selected && clientTypes.includes(clientType)) return;
      if (!selected && !clientTypes.includes(clientType)) return;
      setClientTypes(toggleValueInList(clientType, clientTypes));
    };

  const onGenerate = async () => {
    setError(Maybe.none());
    setToken(Maybe.none());
    setIsBusy(true);
    const result = await trigger({ client_types: clientTypes });
    setIsBusy(false);

    if (Either.isLeft(result)) {
      setError(Maybe.some(result.value));
    } else {
      setToken(Maybe.some(result.value));
    }
  };

  return (
    <TokenForm
      onGenerate={onGenerate}
      onErrorClose={() => setError(Maybe.none())}
      getClientTypeSelector={getClientTypeSelector}
      isClientTypeSelected={isClientTypeSelected}
      token={token}
      error={error}
      isBusy={isBusy}
    />
  );
};
