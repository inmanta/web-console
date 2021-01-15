import { RowPresenter } from "./RowPresenter";
import { instance } from "@app/fixtures";

test("RowPresenter", () => {
  const presenter = new RowPresenter();
  const rows = presenter.createFromInstances([instance]);
  expect(rows[0].id.length).toBe(4);
});
