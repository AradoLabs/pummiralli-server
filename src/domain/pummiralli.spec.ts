import net from 'net';
import Pummiralli from './pummiralli';
import jot from 'json-over-tcp';

test('collects message correctly', () => {
  const ralli = new Pummiralli();
  ralli.collectMessage(new net.Socket(), {
    messageType: 'join',
    data: {
      name: 'test',
    },
  });
  expect(ralli.eventsReceived.length).toBe(1);
});

// Figure out how to handle the socket in tests
//    - Currently it fails when server tries to send a message back
//    - Should the test even have socket or not?
test.skip('name needs to be unique', () => {
  const ralli = new Pummiralli();
  ralli.collectMessage(jot.createSocket(), {
    messageType: 'join',
    data: {
      name: 'test',
    },
  });
  ralli.collectMessage(jot.createSocket(), {
    messageType: 'join',
    data: {
      name: 'test',
    },
  });
  ralli.processEventsReceivedDuringTick();
  expect(ralli.bots.length).toBe(1);
});
