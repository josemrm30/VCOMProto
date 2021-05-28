export default class ChatEntry {
  constructor(entryID, chatID, user, content) {
    this.id = entryID;
    this.chat = chatID;
    this.username = user;
    this.msg = content;
  }
}
