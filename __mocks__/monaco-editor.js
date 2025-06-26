const { vi } = require('vitest');

// Considering we aren't allowed to use the CDN for the monaco editor, we need to mock it for Jest to work.
// This is a simplified mock that covers the basic functionality needed for the tests.

const monaco = {
  editor: {
    getModels: vi.fn().mockReturnValue([]),
    create: vi.fn(() => ({
      getModel: vi.fn().mockReturnValue({
        onDidChangeContent: vi.fn(),
        getValue: vi.fn(),
        setValue: vi.fn(),
        dispose: vi.fn(),
      }),
      onDidChangeModelContent: vi.fn(),
      createModel: vi.fn(),
      setModelLanguage: vi.fn(),
      setValue: vi.fn(),
      getValue: vi.fn(),
      updateOptions: vi.fn(),
      dispose: vi.fn(),
      layout: vi.fn(),
      focus: vi.fn(),
      onDidBlurEditorWidget: vi.fn(),
      onDidFocusEditorWidget: vi.fn(),
      restoreViewState: vi.fn(),
      saveViewState: vi.fn(),
      getSelection: vi.fn(),
      getScrollTop: vi.fn(),
      getScrollLeft: vi.fn(),
      onDidChangeMarkers: vi.fn(),
    })),
    createDiffEditor: vi.fn(() => ({
      setModel: vi.fn(),
      getModel: vi.fn(() => ({
        original: {
          dispose: vi.fn(),
          getValue: vi.fn(),
          setValue: vi.fn(),
          onDidChangeContent: vi.fn(),
        },
        modified: {
          dispose: vi.fn(),
          getValue: vi.fn(),
          setValue: vi.fn(),
          onDidChangeContent: vi.fn(),
        },
      })),
      updateOptions: vi.fn(),
      dispose: vi.fn(),
      layout: vi.fn(),
      focus: vi.fn(),
      onDidUpdateDiff: vi.fn(),
      getDiffLineInformationForOriginal: vi.fn(),
      getDiffLineInformationForModified: vi.fn(),
      restoreViewState: vi.fn(),
      saveViewState: vi.fn(),
    })),
    defineTheme: vi.fn(),
    setTheme: vi.fn(),
    getModel: vi.fn(),
    onDidCreateEditor: vi.fn(),
    createModel: vi.fn(() => ({
      dispose: vi.fn(),
      onDidChangeContent: vi.fn(),
      setValue: vi.fn(),
      getValue: vi.fn(),
    })),
    onDidChangeMarkers: vi.fn(),
    setModelMarkers: vi.fn(),
    getModelMarkers: vi.fn().mockReturnValue([]),
  },
  languages: {
    json: {
      jsonDefaults: {
        setModeConfiguration: vi.fn(),
        setDiagnosticsOptions: vi.fn(),
      },
    },
    register: vi.fn(),
    setMonarchTokensProvider: vi.fn(),
    setLanguageConfiguration: vi.fn(),
  },
  Uri: {
    parse: vi.fn(),
    file: vi.fn(),
  },
  KeyMod: {
    CtrlCmd: 2048,
    Shift: 1024,
    Alt: 512,
    WinCtrl: 256,
  },
  KeyCode: {
    KEY_IN: 0,
  },
};

// Export as both CommonJS and ESM for compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = monaco;
  module.exports.default = monaco;
} else {
  export default monaco;
  export { monaco };
}
