import React, { useState } from "react";
import { Title } from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import { ClientType, toggleValueInList } from "@/Core";
import { getTokensKey, useGenerateToken } from "@/Data/Queries";
import { words } from "@/UI/words";
import { TokenForm } from "./TokenForm";
import { TokenTable } from "./TokenTable";

/**
 * Token tab for the Settings page
 *
 * It handles the generation of tokens for the current environment and lists the
 * registered (revocable) tokens so they can be revoked.
 *
 * @returns {React.FC} The Token tab
 */
export const Tab: React.FC = () => {
  const client = useQueryClient();
  const [clientTypes, setClientTypes] = useState<ClientType[]>(["api"]);
  const [isRevocable, setIsRevocable] = useState(true);
  const [expire, setExpire] = useState<number | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { mutate } = useGenerateToken({
    onError: (error) => setError(error.message),
    onSuccess: (data) => {
      setToken(data.data);
      // A revocable token was added to the registry: refresh the list.
      client.invalidateQueries({ queryKey: getTokensKey.root() });
    },
  });

  const isClientTypeSelected = (clientType: ClientType): boolean =>
    clientTypes.includes(clientType);

  const getClientTypeSelector = (clientType: ClientType) => (selected: boolean) => {
    if (selected && clientTypes.includes(clientType)) {
      return;
    }

    if (!selected && !clientTypes.includes(clientType)) {
      return;
    }

    setClientTypes(toggleValueInList(clientType, clientTypes));
  };

  const onGenerate = async () => {
    setError(null);
    setToken(null);
    setIsBusy(true);
    // Only revocable (non-idempotent) tokens can carry an expiry.
    mutate({
      client_types: clientTypes,
      idempotent: !isRevocable,
      ...(isRevocable && expire !== null ? { expire } : {}),
    });

    setIsBusy(false);
  };

  return (
    <>
      <TokenForm
        onGenerate={onGenerate}
        onErrorClose={() => setError(null)}
        getClientTypeSelector={getClientTypeSelector}
        isClientTypeSelected={isClientTypeSelected}
        isRevocable={isRevocable}
        onRevocableChange={setIsRevocable}
        onExpireChange={setExpire}
        token={token}
        error={error}
        isBusy={isBusy}
      />
      <Title className="lined_section" headingLevel="h2" size="md">
        {words("settings.tabs.token.registered.title")}
      </Title>
      <TokenTable />
    </>
  );
};
