import React, { useState } from "react";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TextInput,
} from "@patternfly/react-core";
import styled from "styled-components";
import { Maybe } from "@/Core";
import {
  CancelEditButton,
  EnableEditButton,
  SubmitEditButton,
} from "./InlineEditButtons";
import { InlinePlainAlert } from "./InlinePlainAlert";

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
    }
  };
  const onKeyDown = async (event) => {
    if (event.key && event.key !== "Enter") return;
    await onSubmitRequest(value);
  };
  const onEditClick = () => {
    setEditable(true);
    setSubmitError("");
  };
  const onSubmitClick = () => onSubmitRequest(value);
  const onCancelEditClick = () => {
    setEditable(false);
    setValue(initialValue);
  };
  const onCloseAlert = () => setSubmitError("");

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
              <EnableEditButton
                aria-label={`${label}-toggle-edit`}
                onClick={onEditClick}
              />
            </FlexItem>
          ) : (
            <FlexItem>
              <Filler />
            </FlexItem>
          )}
        </Flex>
      </DescriptionListTerm>
      {submitError && (
        <InlinePlainAlert
          aria-label={`${label}-error-message`}
          errorMessage={submitError}
          closeButtonAriaLabel={`${label}-close-error`}
          onCloseAlert={onCloseAlert}
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
              <SubmitEditButton
                aria-label={`${label}-submit-edit`}
                onClick={onSubmitClick}
              />
            </FlexItem>
            <FlexItem>
              <CancelEditButton
                aria-label={`${label}-cancel-edit`}
                onClick={onCancelEditClick}
              />
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
