export default class FriendEntry {
  constructor(id, user, since, isAccepted) {
    this.id = id;
    this.user = user;
    this.since = since;
    this.accepted = isAccepted;
  }
}
