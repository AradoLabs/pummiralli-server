import Pummiralli from "../domain/pummiralli";

test("collects message correctly", () => {
  const ralli = new Pummiralli();
  ralli.collectMessage({
    messageType: "join",
    data: {
      name: "test",
    },
  });
  expect(ralli.messages.length).toBe(1);
});
