import { RemoteData } from "@/Core";
import {
  EmptyView,
  ErrorView,
  LoadingView,
  PageSectionWithTitle,
} from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

import React, { useContext } from "react";
import { TableProvider } from "./TableProvider";

const Wrapper: React.FC = ({ children }) => (
  <PageSectionWithTitle title={words("compileReports.title")}>
    {children}
  </PageSectionWithTitle>
);

export const CompileReports: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"CompileReports">({
    kind: "CompileReports",
  });
  return (
    <Wrapper>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => (
            <LoadingView aria-label="CompileReportsView-Loading" />
          ),
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="CompileReportsView-Failed"
            />
          ),
          success: (compileReports) =>
            compileReports.data.length <= 0 ? (
              <EmptyView
                message={words("compileReports.empty.message")}
                aria-label="CompileReportsView-Empty"
              />
            ) : (
              <TableProvider
                compileReports={compileReports.data}
                aria-label="CompileReportsView-Success"
              />
            ),
        },
        data
      )}
    </Wrapper>
  );
};
