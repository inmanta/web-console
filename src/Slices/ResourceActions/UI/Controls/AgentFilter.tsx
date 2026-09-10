import React, { useMemo, useState } from "react";
import { SelectOptionProps, ToolbarFilter } from "@patternfly/react-core";
import { useGetAgents } from "@/Data/Queries";
import { useDebounce } from "@/UI";
import { SingleTextSelect } from "@/UI/Components";
import { words } from "@/UI/words";
import { ResourceActionFilter } from "@S/ResourceActions/Core/Domain";

interface Props {
  filter: ResourceActionFilter;
  setFilter: (filter: ResourceActionFilter) => void;
}

/**
 * Filters resource actions by agent, suggesting known agent names as the user
 * types while still allowing a free-form value.
 *
 * @props {Props} props - The props of the component.
 * @returns {React.FC<Props>} The filter component.
 */
export const AgentFilter: React.FC<Props> = ({ filter, setFilter }) => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data } = useGetAgents().useInfiniteScroll({
    pageSize: { kind: "PageSize", value: "20" },
    filter: debouncedSearch ? { name: [debouncedSearch] } : undefined,
  });

  const options = useMemo<SelectOptionProps[]>(
    () =>
      (data?.pages ?? []).flatMap((page) =>
        page.data.map((agent) => ({ value: agent.name, children: agent.name }))
      ),
    [data]
  );

  const update = (agent: string) => setFilter({ ...filter, agent: agent || undefined });

  return (
    <ToolbarFilter
      labels={filter.agent ? [filter.agent] : []}
      deleteLabel={() => setFilter({ ...filter, agent: undefined })}
      categoryName={words("resourceActions.filter.agent")}
    >
      <SingleTextSelect
        selected={filter.agent || null}
        setSelected={update}
        onSearchTextChanged={setSearch}
        onCreate={update}
        hasCreation
        options={options}
        toggleAriaLabel="AgentFilter"
        placeholderText={words("resourceActions.filter.agent.placeholder")}
      />
    </ToolbarFilter>
  );
};
