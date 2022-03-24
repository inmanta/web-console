import React, { useContext, useState } from "react";
import { Bullseye, Button, Grid, GridItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Diff, Either, RemoteData } from "@/Core";
import { EntryInfo } from "@/UI/Components/DiffWizard/types";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DefaultEntry } from "./DefaultEntry";
import { DiffView } from "./DiffView";
import { Title } from "./utils";

export const FileEntry: React.FC<EntryInfo> = ({
  title,
  fromValue,
  toValue,
}) => {
  const { fileFetcher } = useContext(DependencyContext);
  const [files, setFiles] = useState<
    RemoteData.RemoteData<string, Diff.Values>
  >(RemoteData.notAsked());

  const onShow = async () => {
    setFiles(RemoteData.loading());
    const [from, to] = await Promise.all([
      fromValue.length > 0
        ? fileFetcher.get(fromValue)
        : Promise.resolve(Either.right("")),
      toValue.length > 0
        ? fileFetcher.get(toValue)
        : Promise.resolve(Either.right("")),
    ]);

    if (Either.isLeft(from)) return setFiles(RemoteData.failed(from.value));
    if (Either.isLeft(to)) return setFiles(RemoteData.failed(to.value));
    return setFiles(RemoteData.success({ from: from.value, to: to.value }));
  };

  const onHide = () => setFiles(RemoteData.notAsked());

  return (
    <>
      <DefaultEntry {...{ title, fromValue, toValue }} />
      <Grid>
        <GridItem span={2}>
          <Title>{words("desiredState.compare.file.attributeLabel")}</Title>
        </GridItem>
        <GridItem span={10}>
          {RemoteData.fold(
            {
              notAsked: () => <DefaultView {...{ onShow }} />,
              loading: () => <DefaultView {...{ onShow, isLoading: true }} />,
              failed: (error) => <FailedView {...{ error, onShow }} />,
              success: (files) => <SuccessView {...{ onHide, files }} />,
            },
            files
          )}
        </GridItem>
      </Grid>
    </>
  );
};

const DefaultView: React.FC<{ isLoading?: boolean; onShow(): void }> = ({
  isLoading,
  onShow,
}) => (
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

const FailedView: React.FC<{ error: string; onShow(): void }> = ({
  error,
  onShow,
}) => (
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
