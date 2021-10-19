import React, { useState } from "react";
import {
  Alert,
  AlertActionCloseButton,
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TextInput,
} from "@patternfly/react-core";
import { CheckIcon, PencilAltIcon, TimesIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { Maybe } from "@/Core";

interface Props {
  label: string;
  initialValue: string;
  onSubmit: (value: string) => Promise<Maybe.Type<string>>;
}

export const EditableTextField: React.FC<Props> = ({
  label,
  initialValue,
  onSubmit,
}) => {
  const [editable, setEditable] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [value, setValue] = useState(initialValue);
  const onSubmitRequest = async (value: string) => {
    setEditable(false);
    const error = await onSubmit(value);
    if (Maybe.isSome(error)) {
      setSubmitError(error.value);
      setValue(initialValue);
    }
  };
  const onKeyDown = async (event) => {
    if (event.key && event.key !== "Enter") return;
    await onSubmitRequest(value);
  };

  return (
    <DescriptionListGroup key={label}>
      <DescriptionListTerm>
        <Flex
          direction={{ default: "row" }}
          spaceItems={{ default: "spaceItemsNone" }}
        >
          <LabelItem aria-label={`${label}-label`}>{label}</LabelItem>
          {!editable ? (
            <FlexItem>
              <Button
                aria-label={`${label}-toggle-edit`}
                onClick={() => {
                  setEditable(true);
                  setSubmitError("");
                }}
                variant="plain"
              >
                <PencilAltIcon />
              </Button>
            </FlexItem>
          ) : (
            <FlexItem>
              <Filler />
            </FlexItem>
          )}
        </Flex>
      </DescriptionListTerm>
      {submitError && (
        <WidthLimitedAlert
          aria-label={`${label}-error-message`}
          variant="danger"
          isInline
          isPlain
          title={submitError}
          actionClose={
            <AlertActionCloseButton
              aria-label={`${label}-close-error`}
              onClick={() => setSubmitError("")}
            />
          }
        />
      )}
      <DescriptionListDescription>
        {!editable && (
          <InlineValue aria-label={`${label}-value`}>{value}</InlineValue>
        )}
        {editable && (
          <Flex spaceItems={{ default: "spaceItemsNone" }}>
            <FlexItem>
              <TextInput
                aria-label={`${label}-input`}
                value={value}
                onChange={setValue}
                onKeyDown={onKeyDown}
              />
            </FlexItem>
            <FlexItem>
              <Button
                aria-label={`${label}-submit-edit`}
                onClick={async () => {
                  onSubmitRequest(value);
                }}
                variant="link"
              >
                <CheckIcon />
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                aria-label={`${label}-cancel-edit`}
                onClick={() => {
                  setEditable(false);
                  setValue(initialValue);
                }}
                variant="plain"
              >
                <TimesIcon />
              </Button>
            </FlexItem>
          </Flex>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};

const Filler = styled.div`
  height: 23px;
  width: 60px;
`;

const WidthLimitedAlert = styled(Alert)`
  width: fit-content;
`;

const LabelItem = styled(FlexItem)`
  && {
    line-height: var(--pf-global--LineHeight--md);
    margin-bottom: 7px;
  }
`;

const InlineValue = styled.div`
  padding-bottom: 6px;
  padding-top: 6px;
  padding-left: 9px;
  height: 36px;
`;
