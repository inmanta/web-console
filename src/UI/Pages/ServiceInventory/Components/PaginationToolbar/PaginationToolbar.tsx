import React from "react";
import { ToolbarItem, Button } from "@patternfly/react-core";
import { Pagination } from "@/Core";
import { AngleLeftIcon, AngleRightIcon } from "@patternfly/react-icons";
import { Indicator } from "./Indicator";

export const PaginationToolbar: React.FC<{
  handlers: Pagination.Handlers;
  metadata: Pagination.Metadata;
}> = ({ handlers: { prev, next }, metadata }) => {
  return (
    <ToolbarItem variant="pagination">
      <Indicator metadata={metadata} />
      <Button
        variant="plain"
        onClick={prev}
        isDisabled={!Boolean(prev)}
        aria-label="Prev"
      >
        <AngleLeftIcon />
      </Button>
      <Button
        variant="plain"
        onClick={next}
        isDisabled={!Boolean(next)}
        aria-label="Next"
      >
        <AngleRightIcon />
      </Button>
    </ToolbarItem>
  );
};
