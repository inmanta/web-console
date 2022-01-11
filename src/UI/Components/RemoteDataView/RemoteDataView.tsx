import React from "react";
import { RemoteData } from "@/Core";
import { LoadingView, ErrorView } from "@/UI/Components";
import { words } from "@/UI/words";

interface Props<T> {
  data: RemoteData.RemoteData<string, T>;
  SuccessView: React.FC<{ data: T }>;
  label?: string;
}

export const RemoteDataView = <T,>({
  data,
  label,
  SuccessView,
}: Props<T>): ReturnType<React.FC> => {
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <LoadingView aria-label={label ? `${label}-Loading` : undefined} />
      ),
      failed: (error) => (
        <ErrorView
          title={words("error")}
          message={words("error.general")(error)}
          aria-label={label ? `${label}-Failed` : undefined}
        />
      ),
      success: (successData) => <SuccessView data={successData} />,
    },
    data
  );
};
