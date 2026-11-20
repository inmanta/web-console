import React from "react";
import { Alert, AlertActionLink, Button, Content, Flex, FlexItem } from "@patternfly/react-core";
import { Td, Tr } from "@patternfly/react-table";
import { words } from "@inmanta/web-console-core";
import { useGetFile } from "@inmanta/web-console-core/Queries/Slices/Server";
import { DiffSideLabels } from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/types";
import { AttributeCells } from "./AttributeCells";
import { LongValueDiff } from "./LongValueDiff";
import { ATTRIBUTE_TABLE_COLUMN_COUNT, DiffSide } from "./types";

interface Props extends DiffSideLabels {
  resourceId: string;
  attributeName: string;
  fromHash: string;
  toHash: string;
  sidesWithValues: DiffSide[];
  isStriped: boolean;
}

/**
 * The rows of the hash of a file resource, as a PatternFly expandable row pair: the hash row with
 * a "Compare file content" button under its value, and an expandable row with the line diff of
 * the file content, loaded from the server. When a file fails to load, the expandable row shows
 * the error with a Retry link in place of the button. The diff shows with a "File content" title
 * and a hide button above it. For an added or deleted file, only the version that exists is loaded.
 *
 * @props {Props} props - The component props
 *  @prop {string} resourceId - The id of the file resource, which names its hide button
 *  @prop {string} attributeName - The name of the hash attribute, which labels the diff
 *  @prop {string} fromHash - The hash of the file content the diff starts from, empty when there is none
 *  @prop {string} toHash - The hash of the file content the diff goes to, empty when there is none
 *  @prop {string} fromLabel - The header of the side the diff starts from
 *  @prop {string} toLabel - The header of the side the diff goes to
 *  @prop {DiffSide[]} sidesWithValues - The sides that hold a hash, both unless the file is added or deleted
 *  @prop {boolean} isStriped - Whether the rows of this attribute are striped
 *
 * @returns {React.FC<Props>} The table rows of the hash and its file content
 */
export const FileContentDiff: React.FC<Props> = ({
  resourceId,
  attributeName,
  fromHash,
  toHash,
  fromLabel,
  toLabel,
  sidesWithValues,
  isStriped,
}) => {
  const fromFileRequest = useGetFile(fromHash);
  const toFileRequest = useGetFile(toHash);
  const fileRequests: (typeof fromFileRequest)[] = [];

  if (fromHash) {
    fileRequests.push(fromFileRequest);
  }

  if (toHash) {
    fileRequests.push(toFileRequest);
  }

  const loadFiles = () => fileRequests.forEach((request) => request.mutate());
  const retryFailedFiles = () =>
    fileRequests.filter((request) => request.isError).forEach((request) => request.mutate());
  const hideFiles = () => fileRequests.forEach((request) => request.reset());

  const error = fileRequests.find((request) => request.isError)?.error;
  const isLoaded = fileRequests.length > 0 && fileRequests.every((request) => request.isSuccess);
  const isLoading = fileRequests.some((request) => request.isPending);
  const hasContent = isLoaded || Boolean(error);

  return (
    <>
      <Tr isControlRow isContentExpanded={hasContent} isStriped={isStriped}>
        <AttributeCells
          attributeName={attributeName}
          fromValue={fromHash}
          toValue={toHash}
          sidesWithValues={sidesWithValues}
        >
          {!hasContent && (
            <Button
              variant="link"
              isInline
              isLoading={isLoading}
              isDisabled={isLoading}
              onClick={loadFiles}
            >
              {words("desiredState.compare.file.show")}
            </Button>
          )}
        </AttributeCells>
      </Tr>
      <Tr isExpanded={hasContent} isStriped={isStriped}>
        <Td colSpan={ATTRIBUTE_TABLE_COLUMN_COUNT}>
          {error && (
            <Alert
              isInline
              component="p"
              variant="danger"
              title={words("error")}
              actionLinks={
                <AlertActionLink onClick={retryFailedFiles}>{words("retry")}</AlertActionLink>
              }
            >
              {error.message}
            </Alert>
          )}
          {isLoaded && (
            <LongValueDiff
              attributeName={attributeName}
              fromValue={fromHash ? (fromFileRequest.data ?? "") : ""}
              toValue={toHash ? (toFileRequest.data ?? "") : ""}
              fromLabel={fromLabel}
              toLabel={toLabel}
              header={
                <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
                  <FlexItem>
                    <Content component="small">{words("desiredState.compare.file.title")}</Content>
                  </FlexItem>
                  <Button
                    variant="link"
                    isInline
                    size="sm"
                    aria-label={words("desiredState.compare.file.hideAriaLabel")(resourceId)}
                    onClick={hideFiles}
                  >
                    {words("desiredState.compare.file.hide")}
                  </Button>
                </Flex>
              }
            />
          )}
        </Td>
      </Tr>
    </>
  );
};
