import { useEffect, useState } from "react";

const extractFeatures = (fileContent) => {
  // Parse the fileContent and extract the value of features
  if (!fileContent || typeof fileContent !== "string") {
    return [];
  }
  const strippedStr = fileContent.replace("export", "");
  const script = `(function() { ${strippedStr} return features; })();`;
  return eval(script);
};

const useFeatures = (): string[] => {
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    const checkFileChange = async () => {
      try {
        const response = await fetch("/console/config.js");
        const content = await response.text();
        setFeatures(extractFeatures(content));
      } catch (err) {
        console.error("Error checking the config-file change", err);
      }
    };

    checkFileChange();
  }, []);

  return features || [];
};

export default useFeatures;
