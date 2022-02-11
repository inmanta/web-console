import { DryRun } from "@/Core";
import { resources } from "./DesiredStateDiff";

export const a: DryRun.Model = {
  id: "3eab9e22-4166-4145-80a8-587ccee4a9fc",
  environment: "040687c1-9ad6-4ebc-b146-513760ee4517",
  model: 32,
  date: "2022-02-09T17:45:21.609693",
  total: 4,
  todo: 0,
};
export const b: DryRun.Model = {
  id: "a35064a3-42c1-4723-b60c-7e5942cad753",
  environment: "040687c1-9ad6-4ebc-b146-513760ee4517",
  model: 32,
  date: "2022-02-09T16:58:17.098544",
  total: 4,
  todo: 0,
};
export const c: DryRun.Model = {
  id: "0d88ed3a-e2ee-4590-a127-1d587f5824a3",
  environment: "040687c1-9ad6-4ebc-b146-513760ee4517",
  model: 32,
  date: "2022-02-09T16:50:33.721474",
  total: 4,
  todo: 0,
};

export const d: DryRun.Model = {
  id: "086b2488-326f-4c6a-a5f4-a5843cb19346",
  environment: "040687c1-9ad6-4ebc-b146-513760ee4517",
  model: 32,
  date: "2022-02-09T16:50:10.785976",
  total: 4,
  todo: 0,
};

export const listOfReports = [b, c, d];

export const listResponse: { data: DryRun.Model[] } = {
  data: listOfReports,
};

export const reportResponse: { data: DryRun.Report } = {
  data: {
    summary: a,
    diff: resources,
  },
};
