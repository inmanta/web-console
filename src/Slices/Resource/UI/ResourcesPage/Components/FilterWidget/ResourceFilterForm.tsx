import React from "react";
import { Stack, StackItem, Title } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { AddableTextInput } from "./AddableTextInput";

/**
 * @interface ResourceFilterFormProps
 * @desc Props for ResourceFilterForm.
 * @property {(type: string) => void} onAddType - Callback when a type value is added.
 * @property {(value: string) => void} onAddValue - Callback when a resource value is added.
 * @property {(agent: string) => void} onAddAgent - Callback when an agent value is added.
 */
export interface ResourceFilterFormProps {
    onAddType: (type: string) => void;
    onAddValue: (value: string) => void;
    onAddAgent: (agent: string) => void;
}

/**
 * @component ResourceFilterForm
 * @desc Collects free-form resource identifiers (type, value, agent) and forwards them to the filter state.
 * @param {ResourceFilterFormProps} props - Component props.
 * @returns {React.ReactElement} The rendered resource filter form.
 */
export const ResourceFilterForm: React.FC<ResourceFilterFormProps> = ({
    onAddType,
    onAddValue,
    onAddAgent,
}) => (
    <Stack hasGutter style={{ padding: "1rem 0" }}>
        <StackItem>
            <Title headingLevel="h4" size="md">
                {words("resources.filters.resource.sectionTitle")}
            </Title>
        </StackItem>
        <StackItem>
            <AddableTextInput
                label={words("resources.filters.resource.type.label")}
                placeholder={words("resources.filters.resource.type.placeholder")}
                onAdd={onAddType}
            />
        </StackItem>
        <StackItem>
            <AddableTextInput
                label={words("resources.filters.resource.value.label")}
                placeholder={words("resources.filters.resource.value.placeholder")}
                onAdd={onAddValue}
            />
        </StackItem>
        <StackItem className="pf-u-pt-md">
            <AddableTextInput
                label={words("resources.filters.resource.agent.label")}
                placeholder={words("resources.filters.resource.agent.placeholder")}
                onAdd={onAddAgent}
            />
        </StackItem>
    </Stack>
);

