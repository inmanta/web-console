import { CompileStatus } from "@/Core";
import { CustomDatePresenter } from "@/UI/Utils";
import { response } from "@S/CompileReports/Core/Mock";
import { createCompileReportsTablePresenter } from "./CompileReportsTablePresenter";

const reports = response.data;
const rows = createCompileReportsTablePresenter().createRows(reports);
const datePresenter = new CustomDatePresenter();

const rowFor = (report: (typeof reports)[number]) => rows[reports.indexOf(report)];

test("a report that has not started is queued, with no wait or compile time", () => {
  const report = reports.find((compile) => compile.started === null)!;
  const row = rowFor(report);

  expect(row.status).toBe(CompileStatus.queued);
  expect(row.waitTime).toBe("");
  expect(row.compileTime).toBe("");
});

test("a started, not yet completed report is in progress with a wait time only", () => {
  const report = reports.find((compile) => compile.started && !compile.completed)!;
  const row = rowFor(report);

  expect(row.status).toBe(CompileStatus.inprogress);
  expect(row.waitTime).toBe(datePresenter.diff(report.started!, report.requested));
  expect(row.compileTime).toBe("");
});

test("a completed successful report has status success and a compile time", () => {
  const report = reports.find(
    (compile) => compile.started && compile.completed && compile.success
  )!;
  const row = rowFor(report);

  expect(row.status).toBe(CompileStatus.success);
  expect(row.compileTime).toBe(datePresenter.diff(report.completed!, report.started!));
});

test("a completed unsuccessful report has status failed", () => {
  const report = reports.find(
    (compile) => compile.started && compile.completed && !compile.success
  )!;
  const row = rowFor(report);

  expect(row.status).toBe(CompileStatus.failed);
});
