import EditorWorker from "monaco-editor/editor/editor.worker.js?worker";
import EditorWorkerUrl from "monaco-editor/editor/editor.worker.js?worker&url";
import JsonWorker from "monaco-editor/languages/features/json/json.worker.js?worker";
import JsonWorkerUrl from "monaco-editor/languages/features/json/json.worker.js?worker&url";

// We are explicitly making named exports, to enforce Vite to add the worker to the bundle automatically.
// The GraphQL worker isn't here: the GraphiQL feature registers it (graphqlWorker.ts), so an app
// without GraphiQL doesn't bundle it.
export const editorWorkerPath = EditorWorkerUrl;
export const jsonWorkerPath = JsonWorkerUrl;

export const createMonacoWorker = (label: string) => {
  switch (label) {
    case "json":
      return new JsonWorker();
    default:
      return new EditorWorker();
  }
};
