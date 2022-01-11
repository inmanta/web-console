import React from "react";
import resources from "@/UI/Pages/DesiredStateCompare/diff.json";
import { ReactDiffViewerExample } from "./ReactDiffViewerExample";

export default {
  title: "ReactDiffViewerExample",
  component: ReactDiffViewerExample,
};

export const A: React.FC = () => {
  const oldText = `
Καταπληκτικό κατάστημα. Μέσα σε δύο μέρες είχα τη συσκευή στα χέρια μου. Άψογη κατάσταση κουτας και κινητού.
Αγορά samsung s21+ δώρο φορτιστή σε απίστευτη τιμή 😃😃
`;

  const newText = `
Καταπληκτικό κατάστημα! Μέσα σε δύο μέρες είχα τη συσκευή στα χέρια μου! Άψογη κατάσταση κούτας και κινητού!
Η αγορά αφορά Samsung S21+ με δώρο το φορτιστή σε απίστευτη τιμή! 😃😃
`;
  return <ReactDiffViewerExample oldText={oldText} newText={newText} />;
};

export const B: React.FC = () => {
  return (
    <ReactDiffViewerExample
      oldText={`${resources[0].attributes.name?.r1}`}
      newText={`${resources[0].attributes.name?.r2}`}
    />
  );
};
