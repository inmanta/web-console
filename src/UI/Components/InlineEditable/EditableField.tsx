import React, { useEffect, useState } from "react";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { convertToTitleCase } from "@/UI/Utils";
import {
  CancelEditButton,
  EnableEditButton,
  SubmitEditButton,
} from "./InlineEditButtons";
import { InlineEditButtonFiller, InlineLabelItem } from "./InlineFillers";
import { InlinePlainAlert } from "./InlinePlainAlert";

export interface FieldProps {
  label: string;
  isRequired?: boolean;
  initialValue: string;
  initiallyEditable?: boolean;
  onSubmit: (value: string) => Promise<Maybe.Type<string>>;
}

export type EditViewComponent = React.FC<{
  label: string;
  value: string;
  initialValue: string;
  onChange(value: string): void;
  onSubmit(): void;
}>;

export type StaticViewComponent = React.FC<{ value: string }>;

interface Props extends FieldProps {
  EditView: EditViewComponent;
  StaticView: StaticViewComponent;
  alignActions?: "start" | "end";
}

export const EditableField: React.FC<Props> = ({
  isRequired,
  label,
  initialValue,
  initiallyEditable,
  onSubmit,
  EditView,
  StaticView,
  alignActions,
}) => {
  const alignment =
    alignActions === "end" ? "alignSelfFlexEnd" : "alignSelfFlexStart";
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
            {convertToTitleCase(label)}
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
          <StaticView aria-label={`${label}-value`} value={value} />
        )}
        {editable && (
          <Flex spaceItems={{ default: "spaceItemsNone" }}>
            <FlexItem grow={{ default: "grow" }}>
              <EditView
                aria-label={`${label}-input`}
                label={convertToTitleCase(label)}
                value={value}
                onChange={setValue}
                onSubmit={() => onSubmitRequest(value)}
                initialValue={initialValue}
              />
            </FlexItem>
            <FlexItem alignSelf={{ default: alignment }}>
              <SubmitEditButton
                aria-label={`${label}-submit-edit`}
                onClick={onSubmitClick}
              />
            </FlexItem>
            <FlexItem alignSelf={{ default: alignment }}>
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
