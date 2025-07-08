import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker&url";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker&url";

// We are explicitly making named exports, to enforce Vite to add the worker to the bundle automatically.
export const editorWorkerPath = EditorWorker;
export const jsonWorkerPath = JsonWorker;
