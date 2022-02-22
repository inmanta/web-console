import React, { useState } from "react";
import { Toolbar, ToolbarContent, ToolbarGroup } from "@patternfly/react-core";
import { DateRange } from "@/Core";
import { GlobalStyles } from "@/UI/Styles";
import { MomentDatePresenter } from "@/UI/Utils";
import { TimestampFilter } from "./TimestampFilter";

export default {
  title: "TimestampFilter",
  component: TimestampFilter,
};

export const Default = () => {
  const [timestampFilters, setTimestampFilters] = useState<
    DateRange.Type[] | undefined
  >([]);
  const updateDate = (timestampFilters: DateRange.Type[]) =>
    setTimestampFilters(
      timestampFilters.length > 0 ? timestampFilters : undefined
    );

  return (
    <>
      <GlobalStyles />
      <Toolbar
        clearAllFilters={() => setTimestampFilters([])}
        collapseListedFiltersBreakpoint="xl"
      >
        <ToolbarContent>
          <ToolbarGroup variant="filter-group" aria-label="FilterBar">
            <TimestampFilter
              datePresenter={new MomentDatePresenter()}
              timestampFilters={timestampFilters ? timestampFilters : []}
              update={updateDate}
              isVisible={true}
            />
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
    </>
  );
};
