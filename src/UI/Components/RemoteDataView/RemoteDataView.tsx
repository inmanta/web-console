import React, { ReactElement } from "react";
import { RemoteData } from "@/Core";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { words } from "@/UI/words";

interface Props<T> {
  data: RemoteData.RemoteData<string, T>;
  SuccessView(data: T): ReactElement;
  label?: string;
  retry?: () => void;
}

export const RemoteDataView = <T,>({
  data,
  label,
  SuccessView,
  retry,
}: Props<T>): ReturnType<React.FC> => {
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <LoadingView aria-label={label ? `${label}-Loading` : undefined} />
      ),
      failed: (error) => (
        <ErrorView
          data-testid="ErrorView"
          title={words("error")}
          message={words("error.general")(error)}
          aria-label={label ? `${label}-Failed` : undefined}
          retry={retry}
        />
      ),
      success: SuccessView,
    },
    data,
  );
};
