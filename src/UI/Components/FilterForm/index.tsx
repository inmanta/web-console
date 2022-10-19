import React, { useState } from "react";
import { ToolbarGroup, ToolbarItem } from "@patternfly/react-core";
import { Resource } from "@/Core";
import { words } from "@/UI/words";
import { FreeTextFilter } from "./FreeTextFilter";

type Properties = "type" | "agent" | "value";
interface Props {
  filter: Resource.Filter;
  setFilter: (filter: Resource.Filter) => void;
}
export const FilterForm: React.FC<Props> = ({ filter, setFilter }) => {
  const [typeTextInput, setTypeTextInput] = useState("");
  const [agentTextInput, setAgentTextInput] = useState("");
  const [valueTextInput, setValueTextInput] = useState("");
  const updateType = (types: string[], property: Properties) => {
    return setFilter({
      ...filter,
      [property]: types.length > 0 ? types : undefined,
    });
  };
  const removeChip = (id, prop: Properties) => {
    //assingment is neccesary to avoid ts error due to it's limitation to recognize square brackets property
    const p = filter[prop];
    updateType(p ? p.filter((value) => value !== id) : [], prop);
  };
  const onTextInput = (event) => {
    event.preventDefault();
    let newFilter = { ...filter };
    if (
      typeTextInput.length <= 0 &&
      agentTextInput.length <= 0 &&
      valueTextInput.length <= 0
    ) {
      return;
    }
    if (typeTextInput.length > 0) {
      newFilter = {
        ...newFilter,
        type: filter.type ? [...filter.type, typeTextInput] : [typeTextInput],
      };
    }

    if (agentTextInput.length > 0) {
      newFilter = {
        ...newFilter,
        agent: filter.agent
          ? [...filter.agent, agentTextInput]
          : [agentTextInput],
      };
    }
    if (valueTextInput.length > 0) {
      newFilter = {
        ...newFilter,

        value: filter.value
          ? [...filter.value, valueTextInput]
          : [valueTextInput],
      };
    }
    setFilter(newFilter);
    setTypeTextInput("");
    setAgentTextInput("");
    setValueTextInput("");
  };
  return (
    <ToolbarItem>
      <form onSubmit={onTextInput}>
        <ToolbarGroup>
          <ToolbarItem>
            <FreeTextFilter
              searchEntries={filter.type}
              filterPropertyName={Resource.FilterKind.Type}
              placeholder={words("resources.filters.type.placeholder")}
              removeChip={(cat, id) => removeChip(id, "type")}
              value={typeTextInput}
              setValue={setTypeTextInput}
            />
          </ToolbarItem>
          <ToolbarItem>
            <FreeTextFilter
              searchEntries={filter.agent}
              filterPropertyName={Resource.FilterKind.Agent}
              placeholder={words("resources.filters.agent.placeholder")}
              removeChip={(cat, id) => removeChip(id, "agent")}
              value={agentTextInput}
              setValue={setAgentTextInput}
            />
          </ToolbarItem>
          <ToolbarItem>
            <FreeTextFilter
              searchEntries={filter.value}
              filterPropertyName={Resource.FilterKind.Value}
              placeholder={words("resources.filters.value.placeholder")}
              removeChip={(cat, id) => removeChip(id, "value")}
              value={valueTextInput}
              setValue={setValueTextInput}
              isSubmitVisible
            />
          </ToolbarItem>
        </ToolbarGroup>
      </form>
    </ToolbarItem>
  );
};
