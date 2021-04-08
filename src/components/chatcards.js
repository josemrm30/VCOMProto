export const UserChatCard = ({ username, lastmsg, pp, selected }) => {
  const isSelected = selected ? "bg-white" : "bg-gray-300";
  return (
    <>
      <div
        className={
          "flex p-2 border-gray-300 rounded h-auto hover:bg-white cursor-pointer " +
          isSelected
        }
      >
        <img
          class="inline object-cover w-11 h-11 mr-1 rounded-full"
          src={pp}
          alt="Profile image"
        />
        <div class="pl-2 overflow-hidden">
          <p className="font-semibold block">{username}</p>
          <p className="block truncate max-w-max">{lastmsg}</p>
        </div>
      </div>
      <hr className="my-3 w-10/12 m-auto border-gray-600" />
    </>
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
      <div
        className={
          "flex p-2 border-gray-300 rounded h-auto hover:bg-white cursor-pointer " +
          isSelected
        }
      >
        <div class="pl-2 overflow-hidden">
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
        <img
          class="inline object-cover w-11 h-11 mr-1 rounded-full"
          src={pp}
          alt="Profile image"
        />
        <div class="pl-2 overflow-hidden">
          <p className="font-semibold block">{username}</p>
          <p className="block truncate">{msg}</p>
        </div>
      </div>
    </>
  );
};
