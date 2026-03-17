import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import EditorWorkerUrl from "monaco-editor/esm/vs/editor/editor.worker.js?worker&url";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import JsonWorkerUrl from "monaco-editor/esm/vs/language/json/json.worker.js?worker&url";
import GraphQLWorker from "monaco-graphql/esm/graphql.worker.js?worker";
import GraphQLWorkerUrl from "monaco-graphql/esm/graphql.worker.js?worker&url";

// We are explicitly making named exports, to enforce Vite to add the worker to the bundle automatically.
export const editorWorkerPath = EditorWorkerUrl;
export const jsonWorkerPath = JsonWorkerUrl;
export const graphqlWorkerPath = GraphQLWorkerUrl;

export const createMonacoWorker = (label: string) => {
  switch (label) {
    case "json":
      return new JsonWorker();
    case "graphql":
      return new GraphQLWorker();
    default:
      return new EditorWorker();
  }
};
