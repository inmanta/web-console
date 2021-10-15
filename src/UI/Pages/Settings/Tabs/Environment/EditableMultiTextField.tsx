import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  TextInput,
} from "@patternfly/react-core";
import { CheckIcon, PencilAltIcon, TimesIcon } from "@patternfly/react-icons";
import React, { useState } from "react";

interface Props {
  groupName: string;
  fieldDescriptors: Record<string, string>;
  onSubmit: (fieldDescriptors: Record<string, string>) => void;
}

export const EditableMultiTextField: React.FC<Props> = ({
  groupName,
  fieldDescriptors,
  onSubmit,
}) => {
  const [editable, setEditable] = useState(false);
  const [fieldValues, setFieldValues] = useState(fieldDescriptors);
  const onKeyDown = (event) => {
    if (event.key && event.key !== "Enter") return;
    setEditable(false);
    onSubmit(fieldValues);
  };
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {groupName}
          {!editable && (
            <Button onClick={() => setEditable(true)} variant="plain">
              <PencilAltIcon />
            </Button>
          )}
          {editable && (
            <>
              <Button
                onClick={() => {
                  setEditable(false);
                  onSubmit(fieldValues);
                }}
                variant="plain"
              >
                <CheckIcon />
              </Button>
              <Button
                onClick={() => {
                  setEditable(false);
                  setFieldValues(fieldDescriptors);
                }}
                variant="plain"
              >
                <TimesIcon />
              </Button>
            </>
          )}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <DescriptionList>
            {Object.entries(fieldValues).map(([label, value]) => {
              return (
                <DescriptionListGroup key={label}>
                  <DescriptionListTerm>{label}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {!editable && <span>{value}</span>}
                    {editable && (
                      <Flex spaceItems={{ default: "spaceItemsNone" }}>
                        <FlexItem>
                          <TextInput
                            value={value}
                            onChange={(input) => {
                              const update = { ...fieldValues };
                              update[label] = input;
                              setFieldValues(update);
                            }}
                            onKeyDown={onKeyDown}
                          />
                        </FlexItem>
                      </Flex>
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              );
            })}
          </DescriptionList>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};
