import db from './db';

export default async function handle(message) {
  db.addPlayer(message.Name);
  return "OK";
}
