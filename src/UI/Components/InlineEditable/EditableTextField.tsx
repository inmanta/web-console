import React, { useEffect, useState } from "react";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TextInput,
} from "@patternfly/react-core";
import { Maybe } from "@/Core";
import {
  CancelEditButton,
  EnableEditButton,
  SubmitEditButton,
} from "./InlineEditButtons";
import { InlinePlainAlert } from "./InlinePlainAlert";
import {
  InlineEditButtonFiller,
  InlineLabelItem,
  InlineValue,
} from "./InlineFillers";

interface Props {
  label: string;
  isRequired?: boolean;
  initialValue: string;
  initiallyEditable?: boolean;
  onSubmit: (value: string) => Promise<Maybe.Type<string>>;
}

export const EditableTextField: React.FC<Props> = ({
  isRequired,
  label,
  initialValue,
  initiallyEditable,
  onSubmit,
}) => {
  const [editable, setEditable] = useState(initiallyEditable);
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

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <DescriptionListGroup key={label}>
      <DescriptionListTerm>
        <Flex
          direction={{ default: "row" }}
          spaceItems={{ default: "spaceItemsNone" }}
        >
          <InlineLabelItem aria-label={`${label}-label`}>
            {label}
            {isRequired && (
              <span aria-hidden="true" style={{ color: "red" }}>
                {" "}
                *
              </span>
            )}
          </InlineLabelItem>
          <FlexItem>
            {!editable ? (
              <EnableEditButton
                aria-label={`${label}-toggle-edit`}
                onClick={onEditClick}
              />
            ) : (
              <InlineEditButtonFiller />
            )}
          </FlexItem>
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
