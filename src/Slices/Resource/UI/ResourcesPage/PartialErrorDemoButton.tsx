import React from "react";
import { Button } from "@patternfly/react-core";
import { CurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { words } from "@/UI/words";

/** A page cursor the orchestrator can't decode, so the deferred resources part of the query fails. */
const BROKEN_PAGE: CurrentPage = { kind: "CurrentPage", value: "after=not-a-real-cursor" };

/**
 * Demo button that points the table at an invalid cursor and back. The orchestrator still sends the summary
 * and only fails the deferred resources part, so the page shows the summary with an error in place of the table.
 *
 * @prop {CurrentPage} currentPage - The current page of the table.
 * @prop {Function} setCurrentPage - Changes the current page of the table.
 *
 * @example
 * <PartialErrorDemoButton currentPage={currentPage} setCurrentPage={setCurrentPage} />
 */
export const PartialErrorDemoButton: React.FC<{
  currentPage: CurrentPage;
  setCurrentPage: (currentPage: CurrentPage) => void;
}> = ({ currentPage, setCurrentPage }) => {
  const isBroken = currentPage.value === BROKEN_PAGE.value;

  return (
    <Button
      variant="secondary"
      onClick={() => setCurrentPage(isBroken ? { kind: "CurrentPage", value: "" } : BROKEN_PAGE)}
    >
      {isBroken
        ? words("resources.demoPartialError.fix")
        : words("resources.demoPartialError.break")}
    </Button>
  );
};
