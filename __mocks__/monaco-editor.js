// Considering we aren't allowed to use the CDN for the monaco editor, we need to mock it for Jest to work.
// This is a simplified mock that covers the basic functionality needed for the tests.

module.exports = {
  editor: {
    create: jest.fn(() => ({
      getModel: jest.fn(),
      onDidChangeModelContent: jest.fn(),
      createModel: jest.fn(),
      setModelLanguage: jest.fn(),
      setValue: jest.fn(),
      getValue: jest.fn(),
      updateOptions: jest.fn(),
      dispose: jest.fn(),
      layout: jest.fn(),
      focus: jest.fn(),
      onDidBlurEditorWidget: jest.fn(),
      onDidFocusEditorWidget: jest.fn(),
      restoreViewState: jest.fn(),
      saveViewState: jest.fn(),
      getSelection: jest.fn(),
      getScrollTop: jest.fn(),
      getScrollLeft: jest.fn(),
      onDidChangeMarkers: jest.fn(),
    })),
    createDiffEditor: jest.fn(() => ({
      setModel: jest.fn(),
      getModel: jest.fn(() => ({
        original: {
          dispose: jest.fn(),
          getValue: jest.fn(),
          setValue: jest.fn(),
          onDidChangeContent: jest.fn(),
        },
        modified: {
          dispose: jest.fn(),
          getValue: jest.fn(),
          setValue: jest.fn(),
          onDidChangeContent: jest.fn(),
        },
      })),
      updateOptions: jest.fn(),
      dispose: jest.fn(),
      layout: jest.fn(),
      focus: jest.fn(),
      onDidUpdateDiff: jest.fn(),
      getDiffLineInformationForOriginal: jest.fn(),
      getDiffLineInformationForModified: jest.fn(),
      restoreViewState: jest.fn(),
      saveViewState: jest.fn(),
    })),
    defineTheme: jest.fn(),
    setTheme: jest.fn(),
    getModel: jest.fn(),
    onDidCreateEditor: jest.fn(),
    createModel: jest.fn(() => ({
      dispose: jest.fn(),
      onDidChangeContent: jest.fn(),
      setValue: jest.fn(),
      getValue: jest.fn(),
    })),
    onDidChangeMarkers: jest.fn(),
    setModelMarkers: jest.fn(),
    getModelMarkers: jest.fn().mockReturnValue([]),
  },
  languages: {
    json: {
      jsonDefaults: {
        setModeConfiguration: jest.fn(),
        setDiagnosticsOptions: jest.fn(),
      },
    },
    register: jest.fn(),
    setMonarchTokensProvider: jest.fn(),
    setLanguageConfiguration: jest.fn(),
  },
  Uri: {
    parse: jest.fn(),
    file: jest.fn(),
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
