import React, { useContext, useState } from "react";
import { Bullseye, Button, Grid, GridItem } from "@patternfly/react-core";
import styled from "styled-components";
import { Either, RemoteData } from "@/Core";
import { EntryInfo, TransformEntry } from "@/UI/Components/DiffWizard/types";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { DiffView } from "./DiffView";

interface Props extends EntryInfo {
  transform?: TransformEntry;
}

export const Entry: React.FC<Props> = ({
  title,
  fromValue,
  toValue,
  transform,
}) => {
  if (transform === undefined) {
    return <DefaultEntry {...{ title, fromValue, toValue }} />;
  }

  const transformed = transform(title, fromValue, toValue);

  if (transformed === "Default") {
    return <DefaultEntry {...{ title, fromValue, toValue }} />;
  }

  return <FileEntry {...{ title, fromValue, toValue }} />;
};

const DefaultEntry: React.FC<EntryInfo> = ({
  title,
  fromValue: from,
  toValue: to,
}) => (
  <Grid>
    <GridItem span={2}>
      <Title>{title}</Title>
    </GridItem>
    <GridItem span={10}>
      <DiffView {...{ from, to }} />
    </GridItem>
  </Grid>
);

const FileEntry: React.FC<EntryInfo> = ({ title, fromValue, toValue }) => {
  const { fileFetcher } = useContext(DependencyContext);
  const [files, setFiles] = useState<
    RemoteData.RemoteData<string, { from: string; to: string }>
  >(RemoteData.notAsked());

  const onShow = async () => {
    setFiles(RemoteData.loading());
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
          <Title>{words("desiredState.compare.fileAttribute.label")}</Title>
        </GridItem>
        <GridItem span={10}>
          {RemoteData.fold(
            {
              notAsked: () => (
                <Message>
                  <Button
                    variant="link"
                    isInline
                    onClick={onShow}
                    style={{ lineHeight: "29px" }}
                  >
                    Show file contents
                  </Button>
                </Message>
              ),
              loading: () => (
                <Message>
                  <Button
                    variant="link"
                    isInline
                    onClick={onShow}
                    style={{ lineHeight: "29px" }}
                    isDisabled
                  >
                    Show file contents
                  </Button>
                </Message>
              ),
              failed: (error) => (
                <Message $isColumn>
                  <p>
                    {words("error")}
                    <RetryButton variant="link" isInline onClick={onShow}>
                      Retry
                    </RetryButton>
                  </p>
                  <div>{error}</div>
                </Message>
              ),
              success: (files) => (
                <>
                  <div>
                    <Message>
                      <Button
                        variant="link"
                        isInline
                        onClick={onHide}
                        style={{ lineHeight: "29px" }}
                      >
                        Hide file contents
                      </Button>
                    </Message>
                  </div>
                  <DiffView {...files} />
                </>
              ),
            },
            files
          )}
        </GridItem>
      </Grid>
    </>
  );
};

const Title = styled.span`
  line-height: 29px;
  font-size: 1rem;
  padding: 0 4px;
  display: inline-block;
`;

const Message = styled(Bullseye)<{ $isColumn?: boolean }>`
  line-height: 29px;
  padding: 16px 0;
  ${(p) => (p.$isColumn ? "flex-direction: column;" : "")};
`;

const RetryButton = styled(Button)`
  line-height: 29px;
  margin-left: 4px;
`;
