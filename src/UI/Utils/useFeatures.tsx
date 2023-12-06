import { useEffect, useState } from "react";

const extractFeatures = (fileContent) => {
  // Parse the fileContent and extract the value of features
  if (!fileContent || typeof fileContent !== "string" || fileContent === "") {
    return [];
  }
  const strippedStr = fileContent.replace("export", "");
  const script = `(function() { ${strippedStr} return features; })();`;
  return eval(script);
};

const useFeatures = (): string[] => {
  const [features, setFeatures] = useState(["instanceComposer"]);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const checkFileChange = async () => {
      try {
        const response = await fetch("/console/config.js");
        if (!response.ok) {
          throw new Error(
            "The configuration file couldn't be found at /console/config.js. Running the application without features.",
          );
        }
        const content = await response.text();
        const extractedFeatures = extractFeatures(content);

        if (extractedFeatures !== features) {
          setFeatures(extractedFeatures);
        }
      } catch (err) {
        console.error("Error checking the config-file change", err);
      }
    };

    checkFileChange();
  }, []);

  return features || [];
};

export default useFeatures;
