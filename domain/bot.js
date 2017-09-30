export default class Bot {
  constructor(name, connection) {
    this.name = name;
    this.connection = connection;
  }

  sendMessage(message) {
    this.connection.write(message);
  }
}
