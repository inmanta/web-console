import React, { useState } from "react";
import { ClientType, toggleValueInList } from "@/Core";
import { useGenerateToken } from "@/Data/Queries/Slices/Environment";
import { TokenForm } from "./TokenForm";

/**
 * Token tab for the Settings page
 *
 * It handles the generation of tokens for the current user
 *
 * @returns {React.FC} The Token tab
 */
export const Tab: React.FC = () => {
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { mutate } = useGenerateToken({
    onError: (error) => setError(error.message),
    onSuccess: (data) => setToken(data.data),
  });

  const isClientTypeSelected = (clientType: ClientType): boolean =>
    clientTypes.includes(clientType);

  const getClientTypeSelector = (clientType: ClientType) => (selected: boolean) => {
    if (selected && clientTypes.includes(clientType)) return;

    if (!selected && !clientTypes.includes(clientType)) return;

    setClientTypes(toggleValueInList(clientType, clientTypes));
  };

  const onGenerate = async () => {
    setError(null);
    setToken(null);
    setIsBusy(true);
    mutate({ client_types: clientTypes });

    setIsBusy(false);
  };

  return (
    <TokenForm
      onGenerate={onGenerate}
      onErrorClose={() => setError(null)}
      getClientTypeSelector={getClientTypeSelector}
      isClientTypeSelected={isClientTypeSelected}
      token={token}
      error={error}
      isBusy={isBusy}
    />
  );
};
