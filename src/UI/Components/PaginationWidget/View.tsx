import React from "react";
import { Button } from "@patternfly/react-core";
import { AngleLeftIcon, AngleRightIcon } from "@patternfly/react-icons";
import { Pagination, PageSize } from "@/Core";
import { Indicator } from "./Indicator";
import { PageSizeSelector } from "./PageSizeSelector";

export const View: React.FC<{
  handlers: Pagination.Handlers;
  metadata: Pagination.Metadata;
  pageSize: PageSize.Type;
  setPageSize: (pageSize: PageSize.Type) => void;
}> = ({
  handlers: { prev, next },
  metadata,
  pageSize,
  setPageSize,
  ...props
}) => {
  return (
    <div {...props}>
      <Indicator metadata={metadata} />
      <PageSizeSelector currentPageSize={pageSize} setPageSize={setPageSize} />
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
    </div>
  );
};
