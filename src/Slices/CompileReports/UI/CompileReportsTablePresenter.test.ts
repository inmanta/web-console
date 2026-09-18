import { CompileStatus } from "@/Core";
import { response } from "@S/CompileReports/Core/Mock";
import { createCompileReportsTablePresenter } from "./CompileReportsTablePresenter";

const reports = response.data;
const rows = createCompileReportsTablePresenter().createRows(reports);

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
  // requested 09:07:00 -> started 09:07:20 is a 20 second wait.
  expect(row.waitTime).toBe("20 s");
  expect(row.compileTime).toBe("");
});

test("a completed successful report has status success and a compile time", () => {
  const report = reports.find(
    (compile) => compile.started && compile.completed && compile.success
  )!;
  const row = rowFor(report);

  expect(row.status).toBe(CompileStatus.success);
  // started 09:03:20 -> completed 09:03:40 is a 20 second compile.
  expect(row.compileTime).toBe("20 s");
});

test("a completed unsuccessful report has status failed", () => {
  const report = reports.find(
    (compile) => compile.started && compile.completed && !compile.success
  )!;
  const row = rowFor(report);

  expect(row.status).toBe(CompileStatus.failed);
});
