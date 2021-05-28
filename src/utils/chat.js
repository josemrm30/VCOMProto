export default class Chat {
  constructor(chatID, user, msgsarr) {
    this.id = chatID;
    this.username = user;
    this.msgs = msgsarr;
  }
}
