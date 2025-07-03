import React, { useContext } from "react";
import { Link } from "react-router";
import { Button } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

interface Props {
  compileId: string;
  isExport: boolean;
}

/**
 * CompileReportLink Component
 *
 * A plain link button that displays the text "Export" if it's an export compile link or "Validation".
 * The difference between the two compiles can be spotted in the message present in the details of the event.
 * A validation compile should always contain a key word validate/validation.
 *
 * @prop {Props} props - The props of the CompileReportLink
 *  @prop {string} compileId - The id of the compile required to construct the link towards the Compile details page.
 *  @prop {boolean} isExport - Whether the compile link is forwarding to an export report or not. The other case being a validation report.
 *
 * @returns A CompileReportLink Component
 */
export const CompileReportLink: React.FC<Props> = ({ compileId, isExport }) => {
  const { routeManager } = useContext(DependencyContext);

  return (
    <Link
      to={{
        pathname: routeManager.getUrl("CompileDetails", {
          id: compileId,
        }),
        search: location.search,
      }}
    >
      <Button variant="link" isInline>
        {isExport
          ? words("instanceDetails.events.exportReport")
          : words("instanceDetails.events.validationReport")}
      </Button>
    </Link>
  );
};
