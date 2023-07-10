import { useEffect, useState } from "react";
import { ApiHelper } from "@/Core";
import { GetConfigFileQueryManager } from "@/Data/Managers/GetConfigFile/OneTimeQueryManager";

const useFeatureFlags = (apiHelper: ApiHelper) => {
  const [flagState, setFlagState] = useState<string[]>([]);

  useEffect(() => {
    GetConfigFileQueryManager(apiHelper)
      .then(({ kind, value }) => {
        if (kind === "Right") {
          const availableFlags = value.match(/(?<=")[^"]+(?=")/g);
          if (availableFlags !== null) {
            setFlagState(availableFlags);
          }
        }
      })
      .catch((error) => console.log(error)); // we want it to call it only once on init, yet apiHelper got updated/changed which lead to infinite rerenders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return {
    isComposerAvailable: () => flagState.includes("instanceComposer"),
  };
};

export default useFeatureFlags;
