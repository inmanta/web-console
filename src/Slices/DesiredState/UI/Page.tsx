import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Stack, StackItem } from "@patternfly/react-core";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import { ParsedNumber, hasAnySetValue, words } from "@inmanta/web-console-core";
import { usePaginatedTable } from "@inmanta/web-console-core/Common";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { ModalContext } from "@inmanta/web-console-core/Dependency/ModalContext";
import {
  useDeleteDesiredStateVersion,
  useGetDesiredStates,
} from "@inmanta/web-console-core/Queries/Slices/DesiredState";

import { ConfirmUserActionForm } from "@inmanta/web-console-ui/Components/ConfirmUserActionForm";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { FilterDrawer, countActiveFilters } from "@inmanta/web-console-ui/Components/FilterDrawer";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { PaginationWidget } from "@inmanta/web-console-ui/Components/PaginationWidget";
import { TableControls, ConnectedFilterWidget } from "./Components";
import { DesiredStatesTable } from "./DesiredStatesTable";
import { GetDesiredStatesContext } from "./GetDesiredStatesContext";
import { CompareSelection, applyFilterDefaults } from "./Utils";

/**
 * The Page component that renders the desired state page.
 *
 * @returns {React.FC} The rendered desired state page.
 */
export const Page: React.FC = () => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const deleteVersion = useDeleteDesiredStateVersion();
  const { notifyError } = useAppAlert();

  const { currentPage, setCurrentPage, pageSize, setPageSize, filter, setFilter } =
    usePaginatedTable<Filter>({
      route: "DesiredState",
      filterKeys: { date: "DateRange", version: "IntRange", disregardDefault: "Boolean" },
    });

  const filterWithDefaults = useMemo(() => applyFilterDefaults(filter), [filter]);

  // Checks the filter without its defaults: resetting brings the default status back, so a reset
  // only changes the result when the user set a filter.
  const { disregardDefault: _disregardDefault, ...userFilter } = filter;
  const onResetFilters = hasAnySetValue(userFilter) ? () => setFilter({}) : undefined;

  const [compareSelection, setCompareSelection] = useState<CompareSelection>(undefined);

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const activeFilterCount = useMemo(() => {
    const { disregardDefault: _disregardDefault, ...filterValues } = filterWithDefaults;

    return countActiveFilters(filterValues);
  }, [filterWithDefaults]);

  const { data, refetch, isError, error, isSuccess } = useGetDesiredStates().useContinuous(
    pageSize,
    filterWithDefaults,
    currentPage
  );

  /**
   * function that will open a modal to confirm action to delete a version
   * @param {ParsedNumber} version - the version to delete
   *
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   */
  const setDeleteModal = (version: ParsedNumber) => {
    const onSubmit = async () => {
      await deleteVersion.mutate(version.toString());
      refetch();
      closeModal();
    };

    triggerModal({
      title: words("inventory.deleteVersion.title"),
      content: (
        <>
          {words("inventory.deleteVersion.header")(version)}
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  useEffect(() => {
    if (deleteVersion.isError) {
      notifyError({
        title: words("desiredState.actions.promote.failed"),
        message: deleteVersion.error.message,
      });
    }
  }, [deleteVersion.isError, deleteVersion?.error?.message, notifyError]);

  if (isError) {
    return (
      <ErrorView
        data-testid="ErrorView"
        title={words("error")}
        message={words("error.general")(error.message)}
        ariaLabel="DesiredStatesView-Failed"
        retry={refetch}
      />
    );
  }

  if (isSuccess) {
    return (
      <PageContainer
        pageTitle={words("desiredState.title")}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <GetDesiredStatesContext.Provider
          value={{
            filter: filterWithDefaults,
            pageSize,
            currentPage,
            compareSelection,
            setCompareSelection,
            setDeleteModal,
          }}
        >
          <TableControls
            paginationWidget={
              <PaginationWidget
                data={data}
                pageSize={pageSize}
                setPageSize={setPageSize}
                setCurrentPage={setCurrentPage}
              />
            }
            onToggleFilters={() => setIsDrawerExpanded((prev) => !prev)}
            isDrawerExpanded={isDrawerExpanded}
            activeFilterCount={activeFilterCount}
          />
          <FilterDrawer
            isExpanded={isDrawerExpanded}
            panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}
          >
            {data.data.length <= 0 ? (
              <EmptyView
                message={words("desiredState.empty.message")}
                aria-label="DesiredStatesView-Empty"
                onResetFilters={onResetFilters}
              />
            ) : (
              <Stack hasGutter style={{ flex: "1 1 auto", minHeight: 0, height: "100%" }}>
                <StackItem isFilled style={{ minHeight: 0, height: "100%", overflow: "auto" }}>
                  <DesiredStatesTable rows={data.data} aria-label="DesiredStatesView-Success" />
                </StackItem>
              </Stack>
            )}
          </FilterDrawer>
        </GetDesiredStatesContext.Provider>
      </PageContainer>
    );
  }

  return <LoadingView ariaLabel="DesiredStatesView-Loading" />;
};
