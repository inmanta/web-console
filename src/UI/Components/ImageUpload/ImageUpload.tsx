import React, { useEffect, useState } from "react";
import { DropFileEventHandler } from "react-dropzone";
import {
  Alert,
  AlertActionCloseButton,
  FileUpload,
  FileUploadProps,
} from "@patternfly/react-core";
import { Maybe } from "@/Core";
import { ImageHelper } from "@/Data";
import { words } from "@/UI/words";
import { ImagePreview } from "./ImagePreview";

interface Props {
  "aria-label"?: string;
  initial?: string;
  onComplete: (dataUrl: string) => void;
}

/**
 * A component for uploading images. Shows a preview.
 * @param {string} initial - DataUrl of the image, without the 'data:' scheme part.
 * @param {function} onComplete - The callback called when an image is loaded into the app.
 * The callback is called with the dataUrl of the image, without the 'data:' scheme part.
 */
export const ImageUpload: React.FC<Props> = ({
  initial,
  onComplete,
  "aria-label": ariaLabel,
  ...props
}) => {
  const initialDataUrl = initial ? ImageHelper.addDataScheme(initial) : "";
  const [filename, setFilename] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dataUrl, setDataUrl] = useState(initialDataUrl);
  const [error, setError] = useState<null | string>(null);

  const setFilenameFromDataUrl = (dataUrl: string) => {
    const extension = ImageHelper.getExtensionFromDataUrl(dataUrl);
    setFilename(extension ? `icon.${extension}` : "icon");
  };

  const onDataChange: FileUploadProps["onDataChange"] = (newDataUrl) => {
    setDataUrl(newDataUrl);
    onComplete(ImageHelper.stripDataScheme(newDataUrl));
    setFilenameFromDataUrl(newDataUrl);
  };

  const onClear: FileUploadProps["onClearClick"] = () => {
    setError(null);
    setIsLoading(false);
    setFilename(null);
    setDataUrl("");
    onComplete("");
  };

  const onReadStarted: FileUploadProps["onReadStarted"] = () => {
    setError(null);
    setIsLoading(true);
  };

  const onReadFinished: FileUploadProps["onReadFinished"] = () => {
    setError(null);
    setIsLoading(false);
  };

  const onDropRejected: DropFileEventHandler = ([file]) => {
    const error = ImageHelper.validateFile(file);
    if (Maybe.isNone(error)) {
      setError(words("error.image.unknown")(file.name));
      return;
    }

    if (error.value === "TYPE") {
      setError(words("error.image.type")(file.name, file.type));
      return;
    }

    setError(
      words("error.image.size")(file.name, ImageHelper.formatFileSize(file)),
    );
    return;
  };

  const validated =
    error !== null ? "error" : dataUrl !== "" ? "success" : "default";

  useEffect(() => {
    if (initialDataUrl === "") {
      setFilename(null);
      setDataUrl("");
    } else {
      setFilenameFromDataUrl(initialDataUrl);
      setDataUrl(initialDataUrl);
    }
  }, [initialDataUrl]);

  return (
    <>
      <ImagePreview {...props} dataUrl={dataUrl} />
      <FileUpload
        hideDefaultPreview
        id="simple-text-file"
        type="dataURL"
        filename={filename || ""}
        filenameAriaLabel={ariaLabel}
        filenamePlaceholder="Drag and drop an image or select one"
        onDataChange={onDataChange}
        onReadStarted={onReadStarted}
        onReadFinished={onReadFinished}
        onClearClick={onClear}
        isLoading={isLoading}
        browseButtonText="Select"
        dropzoneProps={{
          accept: ".webp,.svg,.png,.jpg,.jpeg",
          maxSize: 64000,
          onDropRejected,
        }}
        validated={validated}
      >
        {error && (
          <Alert
            isInline
            variant="danger"
            title={words("error.image.title")}
            actionClose={
              <AlertActionCloseButton onClose={() => setError(null)} />
            }
          >
            <p>{error}</p>
          </Alert>
        )}
      </FileUpload>
    </>
  );
};
