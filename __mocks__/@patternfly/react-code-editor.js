/* eslint-disable */
const React = require("react");

// Mock for @patternfly/react-code-editor
module.exports = {
  CodeEditor: ({
    code,
    onChange,
    language,
    height,
    isReadOnly,
    isDownloadEnabled,
    isCopyEnabled,
    isLanguageLabelVisible,
    ...props
  }) => {
    return (
      <div data-testid="code-editor" style={{ height }}>
        <pre data-testid="code-editor-content" {...props}>
          {code}
        </pre>
        {onChange && (
          <textarea
            data-testid="code-editor-textarea"
            value={code}
            onChange={(event) => onChange(event.target.value)}
            style={{ display: "none" }}
          />
        )}
      </div>
    );
  },
  CodeEditorControl: ({ onClick, icon, "aria-label": ariaLabel, ...props }) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>
      {icon}
    </button>
  ),
  Language: {
    markdown: "markdown",
    json: "json",
    xml: "xml",
    python: "python",
    yaml: "yaml",
    javascript: "javascript",
    typescript: "typescript",
  },
};

/* eslint-enable */
