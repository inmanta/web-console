import { getValidationFailureMessage } from "./DiagnosticsModal";
import { IServiceInstanceModel } from "@app/Models/LsmModels";

describe('getValidationFailureMessage function', () => {
  it('Should find the correct compile report when there are multiple in the logs', async () => {
    fetchMock.once(JSON.stringify(
      { data: [{ version: 2, events: [{ id_compile_report: "a", timestamp: "2020-09-08T18:06:04.264697" }, { id_compile_report: "b", timestamp: "2020-09-08T18:06:09.130214" }] }] }
    ));
    const errorMessage = "A bandwidth can't be negative"
    fetchMock.once(JSON.stringify({ report: { reports: [{ returncode: 1, errstream: "Something happened" }], compile_data: { type: "ValidationError", message: errorMessage } } }))
    const errorWithTrace = await getValidationFailureMessage({ id: "id1", version: 2 } as IServiceInstanceModel, "lsm", "envId1", () => { return; }, undefined);
    expect(fetchMock.mock.calls).toHaveLength(2);
    expect(fetchMock.mock.calls[1][0]).toEqual("/api/v1/compilereport/b");
    if (!errorWithTrace) {
      fail();
    }
    expect(JSON.parse(errorWithTrace.errorMessage).message).toEqual(errorMessage);
  });
  it('Should return when there\'s no matching compile report', async () => {
    fetchMock.once(JSON.stringify(
      { data: [{ version: 2, events: [{ timestamp: "2020-09-08T18:06:04.264697" }, {timestamp: "2020-09-08T18:06:09.130214" }] }] }
    ));
    const errorMessage = "A bandwidth can't be negative"
    const errorWithTrace = await getValidationFailureMessage({ id: "id1", version: 2 } as IServiceInstanceModel, "lsm", "envId1", () => { return; }, undefined);
    expect(fetchMock.mock.calls).toHaveLength(1);
    expect(errorWithTrace).toBeFalsy();
  });



});