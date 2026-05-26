import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Drawer, DrawerContent, DrawerContentBody } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { usePaginatedTable } from "@/Data";
import { useDeleteDesiredStateVersion, useGetDesiredStates } from "@/Data/Queries";
import { Filter } from "@/Slices/DesiredState/Core/Types";
import {
  PageContainer,
  ConfirmUserActionForm,
  EmptyView,
  LoadingView,
  ErrorView,
  PaginationWidget,
  countActiveFilters,
} from "@/UI/Components";
import { useAppAlert } from "@/UI/Root/Components/AppAlertProvider";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { DesiredStateVersionStatus } from "../Core/Domain";
import { TableControls, ConnectedFilterWidget } from "./Components";
import { DesiredStatesTable } from "./DesiredStatesTable";
import { GetDesiredStatesContext } from "./GetDesiredStatesContext";
import { CompareSelection } from "./Utils";

/**
 * The Page component that renders the desired state page.
 *
 * @returns {React.FC} The rendered desired state page.
 */
export const Page: React.FC = () => {
  const { triggerModal, closeModal } = useContext(ModalContext);
  const deleteVersion = useDeleteDesiredStateVersion();
  const { notifyError } = useAppAlert();

  const { currentPage, setCurrentPage, pageSize, setPageSize, filter } =
    usePaginatedTable<Filter>({
      route: "DesiredState",
      filterKeys: { date: "DateRange", version: "IntRange" },
    });

  const filterWithDefaults = useMemo(
    () =>
      filter.status
        ? filter
        : {
            ...filter,
            status: [
              DesiredStateVersionStatus.active,
              DesiredStateVersionStatus.candidate,
              DesiredStateVersionStatus.retired,
            ],
          },
    [filter]
  );

  const [compareSelection, setCompareSelection] = useState<CompareSelection>({
    kind: "None",
  });

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const onCloseFilterWidget = useCallback(() => {
    setIsDrawerExpanded(false);
  }, []);

  const activeFilterCount = useMemo(
    () => countActiveFilters(filterWithDefaults),
    [filterWithDefaults]
  );

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
      <PageContainer pageTitle={words("desiredState.title")}>
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
          <Drawer
            isExpanded={isDrawerExpanded}
            isInline
            style={{ display: "flex", flexDirection: "column", flex: "1 1 auto" }}
          >
            <DrawerContent
              panelContent={<ConnectedFilterWidget onClose={onCloseFilterWidget} />}
            >
              <DrawerContentBody
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  minHeight: 0,
                }}
              >
                {data.data.length <= 0 ? (
                  <EmptyView
                    message={words("desiredState.empty.message")}
                    aria-label="DesiredStatesView-Empty"
                  />
                ) : (
                  <DesiredStatesTable rows={data.data} aria-label="DesiredStatesView-Success" />
                )}
              </DrawerContentBody>
            </DrawerContent>
          </Drawer>
        </GetDesiredStatesContext.Provider>
      </PageContainer>
    );
  }

  return <LoadingView ariaLabel="DesiredStatesView-Loading" />;
};
