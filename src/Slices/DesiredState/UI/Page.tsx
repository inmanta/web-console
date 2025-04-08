import React, { useContext, useEffect, useState } from "react";
import { ParsedNumber, RemoteData } from "@/Core";
import { useUrlStateWithFilter, useUrlStateWithPageSize } from "@/Data";
import { useUrlStateWithCurrentPage } from "@/Data/Common/UrlState/useUrlStateWithCurrentPage";
import { getPaginationHandlers } from "@/Data/Managers/Helpers";
import { useDeleteDesiredStateVersion, useGetDesiredStates } from "@/Data/Managers/V2/DesiredState";
import {
  ToastAlert,
  PageContainer,
  OldPaginationWidget,
  ConfirmUserActionForm,
  EmptyView,
  LoadingView,
  ErrorView,
} from "@/UI/Components";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { Filter } from "@S/DesiredState/Core/Query";
import { DesiredStateVersionStatus } from "../Core/Domain";
import { TableControls } from "./Components";
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

  const [errorMessage, setErrorMessage] = useState("");

  const [currentPage, setCurrentPage] = useUrlStateWithCurrentPage({
    route: "DesiredState",
  });
  const [pageSize, setPageSize] = useUrlStateWithPageSize({
    route: "DesiredState",
  });
  const [filter, setFilter] = useUrlStateWithFilter<Filter>({
    default: {
      status: [
        DesiredStateVersionStatus.active,
        DesiredStateVersionStatus.candidate,
        DesiredStateVersionStatus.retired,
      ],
    },
    route: "DesiredState",
    keys: { date: "DateRange", version: "IntRange" },
  });

  const [compareSelection, setCompareSelection] = useState<CompareSelection>({
    kind: "None",
  });

  const { data, refetch, isError, error, isSuccess } = useGetDesiredStates().useContinuous(
    pageSize,
    filter,
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
      setErrorMessage(deleteVersion.error.message);
    }
  }, [deleteVersion.isError, deleteVersion.error]);

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
    const handlers =
      typeof data.links === "undefined" ? {} : getPaginationHandlers(data.links, data.metadata);

    return (
      <PageContainer pageTitle={words("desiredState.title")}>
        <GetDesiredStatesContext.Provider
          value={{
            filter,
            pageSize,
            currentPage,
            setErrorMessage,
            compareSelection,
            setCompareSelection,
            setDeleteModal,
          }}
        >
          <TableControls
            filter={filter}
            setFilter={setFilter}
            paginationWidget={
              <OldPaginationWidget
                data={RemoteData.success({
                  handlers,
                  metadata: data.metadata,
                })}
                pageSize={pageSize}
                setPageSize={setPageSize}
                setCurrentPage={setCurrentPage}
              />
            }
          />
          <ToastAlert
            data-testid="ToastAlert"
            title={words("desiredState.actions.promote.failed")}
            message={errorMessage}
            setMessage={setErrorMessage}
          />
          {data.data.length <= 0 ? (
            <EmptyView
              message={words("desiredState.empty.message")}
              aria-label="DesiredStatesView-Empty"
            />
          ) : (
            <DesiredStatesTable rows={data.data} aria-label="DesiredStatesView-Success" />
          )}
        </GetDesiredStatesContext.Provider>
      </PageContainer>
    );
  }

  return <LoadingView ariaLabel="DesiredStatesView-Loading" />;
};
