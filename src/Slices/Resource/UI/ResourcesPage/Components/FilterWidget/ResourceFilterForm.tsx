import React, { useMemo, useState } from "react";
import { Stack, StackItem, Switch, Title } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { useGetAgents } from "@/Data/Queries";
import { useDebounce } from "@/UI";
import { words } from "@/UI/words";
import { AddableSelectInput, SelectOption } from "./AddableSelectInput";
import { AddableTextInput } from "./AddableTextInput";

export interface ResourceFilterFormProps {
  onAddType: (type: string) => void;
  onAddValue: (value: string) => void;
  onAddAgent: (agent: string) => void;
  onChangeStatus: (statuses: string[]) => void;
  filter: Resource.Filter;
}

/** These are the statuses which filter out the report only resources. */
const REPORT_ONLY_STATUSES: (Resource.ComplianceKey | Resource.LastHandlerRunKey)[] = [
  "non_compliant",
  "successful",
] as const;

/**
 * The ResourceFilterForm component.
 *
 * Collects free-form resource identifiers (type, value, agent) and forwards them to the filter state.
 *
 * @Props {ResourceFilterFormProps} - Component props.
 *  @prop {(type: string) => void} onAddType - Callback when a type value is added.
 *  @prop {(value: string) => void} onAddValue - Callback when a resource value is added.
 *  @prop {(agent: string) => void} onAddAgent - Callback when an agent value is added.
 *  @prop {Resource.Filter} filter - Current filter state supplied by the parent.
 * @returns {React.ReactElement} The rendered resource filter form.
 */
export const ResourceFilterForm: React.FC<ResourceFilterFormProps> = ({
  onAddType,
  onAddValue,
  onAddAgent,
  onChangeStatus,
  filter,
}) => {
  const [agentSearch, setAgentSearch] = useState("");
  const [inputMode, setInputMode] = useState<"select" | "text">("select");
  const debouncedSearch = useDebounce(agentSearch, 500);

  const { data, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage } =
    useGetAgents().useInfiniteScroll({
      pageSize: { kind: "PageSize", value: "20" },
      filter: debouncedSearch ? { name: [debouncedSearch] } : undefined,
    });

  const agentOptions = useMemo<SelectOption[]>(() => {
    if (!data?.pages) {
      return [];
    }

    return data.pages.flatMap((page) =>
      page.data.map((agent) => ({
        value: agent.name,
        label: agent.name,
      }))
    );
  }, [data]);

  const handlePurgedChange = (hasChanged: boolean) => {
    const current = filter.status ?? [];

    const updated = hasChanged ? [...current, "purged"] : current.filter((s) => s !== "purged");

    onChangeStatus(updated);
  };

  const handleReportOnlyChange = (hasChanged: boolean) => {
    const current = filter.status ?? [];

    const updated = hasChanged
      ? [...new Set([...current, ...REPORT_ONLY_STATUSES])]
      : current.filter(
          (s) =>
            !REPORT_ONLY_STATUSES.includes(s as Resource.ComplianceKey | Resource.LastHandlerRunKey)
        );

    onChangeStatus(updated);
  };

  return (
    <>
      <Stack hasGutter style={{ padding: "1rem 0" }}>
        <StackItem>
          <Title headingLevel="h3" size="md">
            {words("resources.filters.resource.sectionTitle")}
          </Title>
        </StackItem>
        <StackItem>
          <AddableTextInput
            label={words("resources.filters.resource.type.label")}
            placeholder={words("resources.filters.resource.type.placeholder")}
            onAdd={onAddType}

            //TODO: decide what to do with the hints for these inputs, releated to:
            // https://github.com/inmanta/web-console/issues/6823
            /* hint={words("resources.filters.resource.type.hint")} */
          />
        </StackItem>
        <StackItem>
          <AddableTextInput
            label={words("resources.filters.resource.value.label")}
            placeholder={words("resources.filters.resource.value.placeholder")}
            onAdd={onAddValue}

            /* hint={words("resources.filters.resource.value.hint")} */
          />
        </StackItem>
        <StackItem>
          {inputMode === "select" ? (
            <AddableSelectInput
              label={words("resources.filters.resource.agent.label")}
              placeholder={words("resources.filters.resource.agent.placeholder")}
              onAdd={onAddAgent}
              options={agentOptions.filter((option) => !filter.agent?.includes(option.value))}
              onFilter={setAgentSearch}
              onReachEnd={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
              }}
              isLoading={isLoading || isFetchingNextPage}
              onToggleInputMode={() => setInputMode("text")}
            />
          ) : (
            <AddableTextInput
              label={words("resources.filters.resource.agent.label")}
              placeholder={words("resources.filters.resource.agent.placeholder")}
              onAdd={onAddAgent}
              onToggleInputMode={() => setInputMode("select")}

              /* hint={words("resources.filters.resource.agent.hint")} */
            />
          )}
        </StackItem>
      </Stack>
      <Stack hasGutter style={{ padding: "1rem 0" }}>
        <StackItem>
          <Title headingLevel="h3" size="md">
            {words("resources.filters.desiredState.sectionTitle")}
          </Title>
        </StackItem>
        <StackItem>
          <Switch
            id={words("resources.filters.desiredState.purged")}
            aria-label={words("resources.filters.desiredState.purged")}
            label={words("resources.filters.desiredState.purged")}
            isChecked={filter.status?.includes("purged") ?? false}
            onChange={(_event, hasChanged) => handlePurgedChange(hasChanged)}
            isReversed
          />
        </StackItem>
        <StackItem>
          <Switch
            id={words("resources.filters.desiredState.reportOnly")}
            aria-label={words("resources.filters.desiredState.reportOnly")}
            label={words("resources.filters.desiredState.reportOnly")}
            isChecked={REPORT_ONLY_STATUSES.every((s) => filter.status?.includes(s)) ?? false}
            onChange={(_event, hasChanged) => handleReportOnlyChange(hasChanged)}
            isReversed
          />
        </StackItem>
      </Stack>
    </>
  );
};
