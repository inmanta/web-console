import React from "react";
import { Button } from "@patternfly/react-core";
import { Pagination } from "@/Core";
import { AngleLeftIcon, AngleRightIcon } from "@patternfly/react-icons";
import { Indicator } from "./Indicator";
import { PageSizeSelector } from "./PageSizeSelector";

export const PaginationWidget: React.FC<{
  handlers: Pagination.Handlers;
  metadata: Pagination.Metadata;
  pageSize: number;
  setPageSize?: (pageSize: number) => void;
}> = ({ handlers: { prev, next }, metadata, pageSize, setPageSize }) => {
  return (
    <>
      <Indicator metadata={metadata} />
      {setPageSize && (
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      )}
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
    </>
  );
};
