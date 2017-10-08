import net from "net";
import Pummiralli from "../domain/pummiralli";

test("collects message correctly", () => {
  const ralli = new Pummiralli();
  ralli.collectMessage(new net.Socket(), {
    messageType: "join",
    data: {
      name: "test",
    },
  });
  expect(ralli.eventsReceived.length).toBe(1);
});
