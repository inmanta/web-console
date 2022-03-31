import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { Delayed } from "@/UI/Utils";
import { words } from "@/UI/words";

interface Props {
  environment: string;
}

export const PageInitializer: React.FC<Props> = ({ children, environment }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [environmentSettingsData, retry] =
    queryResolver.useOneTime<"GetEnvironmentSettings">({
      kind: "GetEnvironmentSettings",
      environment: environment,
    });
  const label = "EnvironmentSettings";

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <Delayed delay={500}>
          <LoadingView aria-label={`${label}-Loading`} />
        </Delayed>
      ),
      failed: (error) => (
        <ErrorView
          title={words("error")}
          message={words("error.general")(error)}
          aria-label={`${label}-Failed`}
          retry={retry}
        />
      ),
      success: () => <>{children}</>,
    },
    environmentSettingsData
  );
};
