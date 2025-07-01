import { vi } from "vitest";

// This is a simplified mock that covers the basic functionality needed for the tests.

const editor = {
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
};

const languages = {
  json: {
    jsonDefaults: {
      setModeConfiguration: vi.fn(),
      setDiagnosticsOptions: vi.fn(),
    },
  },
  register: vi.fn(),
  setMonarchTokensProvider: vi.fn(),
  setLanguageConfiguration: vi.fn(),
};

const Uri = {
  parse: vi.fn(),
  file: vi.fn(),
};

const KeyMod = {
  CtrlCmd: 2048,
  Shift: 1024,
  Alt: 512,
  WinCtrl: 256,
};

const KeyCode = {
  KEY_IN: 0,
};

export {
  editor,
  languages,
  Uri,
  KeyMod,
  KeyCode,
};
export default { editor, languages, Uri, KeyMod, KeyCode };
