import React, { useEffect, useState } from "react";
import {
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import { convertToTitleCase } from "@/UI/Utils";
import { CancelEditButton, EnableEditButton, SubmitEditButton } from "./InlineEditButtons";
import { InlineEditButtonFiller, InlineLabelItem } from "./InlineFillers";

export interface FieldProps {
  label: string;
  isRequired?: boolean;
  initialValue: string;
  initiallyEditable?: boolean;
  onSubmit: (value: string) => void;
  setError: (error: string | null) => void;
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
  setError: (error: string | null) => void;
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
  setError,
}) => {
  const alignment = alignActions === "end" ? "alignSelfFlexEnd" : "alignSelfFlexStart";
  const [editable, setEditable] = useState(initiallyEditable);
  const [value, setValue] = useState(initialValue);

  const onSubmitRequest = async (value: string) => {
    setEditable(false);
    onSubmit(value);
  };

  const onEditClick = () => {
    setEditable(true);
    setError(null);
  };

  const onSubmitClick = () => onSubmitRequest(value);

  const onCancelEditClick = () => {
    setEditable(false);
    setValue(initialValue);
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <DescriptionListGroup key={label}>
      <DescriptionListTerm>
        <Flex direction={{ default: "row" }} spaceItems={{ default: "spaceItemsNone" }}>
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
              <EnableEditButton aria-label={`${label}-toggle-edit`} onClick={onEditClick} />
            ) : (
              <InlineEditButtonFiller />
            )}
          </FlexItem>
        </Flex>
      </DescriptionListTerm>
      <DescriptionListDescription>
        {!editable && <StaticView data-testid={`${label}-value`} value={value} />}
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
              <SubmitEditButton aria-label={`${label}-submit-edit`} onClick={onSubmitClick} />
            </FlexItem>
            <FlexItem alignSelf={{ default: alignment }}>
              <CancelEditButton aria-label={`${label}-cancel-edit`} onClick={onCancelEditClick} />
            </FlexItem>
          </Flex>
        )}
      </DescriptionListDescription>
    </DescriptionListGroup>
  );
};
