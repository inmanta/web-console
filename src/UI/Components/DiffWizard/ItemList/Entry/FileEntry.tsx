import React from "react";
import { Bullseye, Button, Grid, GridItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Diff } from "@/Core";
import { useGetFile } from "@/Data/Queries/V2/Server/GetFile";
import { EntryInfo } from "@/UI/Components/DiffWizard/types";
import { words } from "@/UI/words";
import { DefaultEntry } from "./DefaultEntry";
import { DiffView } from "./DiffView";
import { Title } from "./utils";

/**
 * A component that displays a file entry in the diff wizard.
 * @param title - The title of the file entry.
 * @param fromValue - The value of the file entry from the previous state.
 * @param toValue - The value of the file entry from the current state.
 */
export const FileEntry: React.FC<EntryInfo> = ({ title, fromValue, toValue }) => {
  const fromFile = useGetFile(fromValue);
  const toFile = useGetFile(toValue);
  const onShow = async () => {
    if (fromValue.length > 0 && toValue.length > 0) {
      fromFile.mutate();
      toFile.mutate();
    }
  };

  const onHide = () => {
    fromFile.reset();
    toFile.reset();
  };

  const wrapper = (content: React.ReactNode) => (
    <>
      <DefaultEntry {...{ title, fromValue, toValue }} />
      <Grid>
        <GridItem span={2}>
          <Title>{words("desiredState.compare.file.attributeLabel")}</Title>
        </GridItem>
        <GridItem span={10}>{content}</GridItem>
      </Grid>
    </>
  );

  if (fromFile.isError || toFile.isError) {
    return wrapper(
      <FailedView
        error={fromFile.error?.message || toFile.error?.message || words("error")}
        onShow={onShow}
      />
    );
  }

  if (fromFile.isSuccess && toFile.isSuccess) {
    return wrapper(
      <SuccessView onHide={onHide} files={{ from: fromFile.data, to: toFile.data }} />
    );
  }

  return wrapper(
    <DefaultView onShow={onShow} isLoading={fromFile.isPending || toFile.isPending} />
  );
};

const DefaultView: React.FC<{ isLoading?: boolean; onShow(): void }> = ({ isLoading, onShow }) => (
  <Message>
    <Button
      variant="link"
      isInline
      onClick={onShow}
      style={{ lineHeight: "29px" }}
      isDisabled={isLoading}
    >
      {words("desiredState.compare.file.show")}
    </Button>
  </Message>
);

const FailedView: React.FC<{ error: string; onShow(): void }> = ({ error, onShow }) => (
  <ErrorMessage aria-label="ErrorDiffView">
    <p>
      {words("error")}
      <RetryButton variant="link" isInline onClick={onShow}>
        {words("retry")}
      </RetryButton>
    </p>
    <div>{error}</div>
  </ErrorMessage>
);

const SuccessView: React.FC<{
  files: Diff.Values;
  onHide(): void;
}> = ({ onHide, files }) => (
  <>
    <div>
      <Message>
        <StyledButton variant="link" isInline onClick={onHide}>
          {words("desiredState.compare.file.hide")}
        </StyledButton>
      </Message>
    </div>
    <DiffView {...files} />
  </>
);

const Message = styled(Bullseye)`
  line-height: 29px;
  padding: 16px 0;
`;

const ErrorMessage = styled(Message)`
  flex-direction: column;
`;

const StyledButton = styled(Button)`
  line-height: 29px;
`;

const RetryButton = styled(StyledButton)`
  margin-left: 4px;
`;
