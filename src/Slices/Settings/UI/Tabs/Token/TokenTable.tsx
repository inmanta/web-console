import React, { useContext } from "react";
import { Button, Label } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";
import { useGetTokens, useRevokeToken } from "@/Data/Queries";
import { EmptyView, ErrorView, LoadingView } from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";

const formatDate = (value: string | null): string =>
  value ? new Date(value).toLocaleString() : "-";

/**
 * Lists the registered (revocable) tokens of the current environment and allows revoking them.
 *
 * @returns {React.FC} The token registry table.
 */
export const TokenTable: React.FC = () => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { data, isSuccess, isError, error, refetch } = useGetTokens().useOneTime();
  const revoke = useRevokeToken();

  const confirmRevoke = (jti: string) => {
    triggerModal({
      title: words("settings.tabs.token.revoke.title"),
      iconVariant: "danger",
      content: words("settings.tabs.token.revoke.confirm")(jti),
      actions: [
        <Button
          key="confirm"
          variant="danger"
          aria-label="confirm-revoke"
          onClick={() => {
            revoke.mutate(jti);
            closeModal();
          }}
        >
          {words("settings.tabs.token.revoke")}
        </Button>,
        <Button key="cancel" variant="link" onClick={closeModal}>
          {words("cancel")}
        </Button>,
      ],
    });
  };

  if (isError) {
    return (
      <ErrorView
        title={words("error")}
        message={words("error.general")(error.message)}
        ariaLabel="TokenTable-Failed"
        retry={refetch}
      />
    );
  }

  if (!isSuccess) {
    return <LoadingView ariaLabel="TokenTable-Loading" />;
  }

  if (data.length === 0) {
    return <EmptyView message={words("settings.tabs.token.empty")} aria-label="TokenTable-Empty" />;
  }

  return (
    <Table aria-label="tokens-table" variant="compact">
      <Thead>
        <Tr>
          <Th>{words("settings.tabs.token.column.createdBy")}</Th>
          <Th>{words("settings.tabs.token.column.clientTypes")}</Th>
          <Th>{words("settings.tabs.token.column.issuedAt")}</Th>
          <Th>{words("settings.tabs.token.column.lastUsed")}</Th>
          <Th>{words("settings.tabs.token.column.status")}</Th>
          <Th screenReaderText={words("common.emptyColumnHeader")} />
        </Tr>
      </Thead>
      <Tbody>
        {data.map((token) => (
          <Tr key={token.jti} aria-label={`token-row-${token.jti}`}>
            <Td>{token.created_by ?? "-"}</Td>
            <Td>{token.client_types.join(", ")}</Td>
            <Td>{formatDate(token.issued_at)}</Td>
            <Td>{formatDate(token.last_used)}</Td>
            <Td>
              {token.revoked ? (
                <Label color="red">{words("settings.tabs.token.status.revoked")}</Label>
              ) : (
                <Label color="green">{words("settings.tabs.token.status.active")}</Label>
              )}
            </Td>
            <Td isActionCell>
              <Button
                variant="danger"
                isDisabled={token.revoked}
                aria-label={`revoke-${token.jti}`}
                onClick={() => confirmRevoke(token.jti)}
              >
                {words("settings.tabs.token.revoke")}
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
