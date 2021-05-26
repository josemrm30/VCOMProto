import { Avatar } from "./avatar";

export const UserChatCard = ({ username, lastmsg, pp, selected, onClick }) => {
  const isSelected = selected ? "bg-white" : "bg-gray-300";
  return (
    <li
      className="mb-3"
      onClick={() => {
        console.log(username)
        onClick()
      }}
    >
      <div className={"chat-card-dark " + isSelected}>
        <Avatar className="inline" src={pp} />
        <div className="pl-2 overflow-hidden">
          <p className="font-semibold block">{username}</p>
          <p className="block truncate max-w-max">{lastmsg}</p>
        </div>
      </div>
      <hr className="my-3 w-10/12 m-auto border-gray-600" />
    </li>
  );
};

export const GroupChatCard = ({
  groupname,
  lastmsg,
  lastmsgnick,
  selected,
}) => {
  const isSelected = selected ? "bg-white" : "bg-gray-300";
  return (
    <>
      <div className={"chat-card-dark " + isSelected}>
        <div className="pl-2 overflow-hidden">
          <p className="font-semibold block truncate">{groupname}</p>
          <div>
            <p className="inline-block truncate font-medium">{lastmsgnick}</p>
            <p className="inline-block truncate">: {lastmsg}</p>
          </div>
        </div>
      </div>
      <hr className="my-3 w-10/12 m-auto border-gray-600" />
    </>
  );
};

export const MessageCard = ({ username, msg, pp }) => {
  return (
    <>
      <div className="flex p-2 rounded h-auto">
        <Avatar src={pp} />
        <div className="pl-2 overflow-hidden">
          <p className="font-semibold block">{username}</p>
          <p className="block truncate">{msg}</p>
        </div>
      </div>
    </>
  );
};
