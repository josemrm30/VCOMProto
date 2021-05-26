import { Avatar } from "./avatar";

export const FriendRequestTextBox = () => {
    return(
        <div className="flex-1 mt-2">
            <input type="text" className="text-black" placeholder="Enter user ID..."></input>
            <button className="ml-3 inline btn-black-inverted">Send!</button>
        </div>
    );
}

export const FriendElement = ({ pp, text }) => {
  return (
    <div className="flex p-1 my-1">
      <Avatar src={pp} sizex="12" sizey="12" />
      <div className="flex-1 pl-2 overflow-hidden">
        <p className="font-semibold text-2xl block">TestUser</p>
        <p className="block truncate text-xl max-w-max">{text}</p>
      </div>
      <div className="inline-flex">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline h-10 w-10 mr-5 p-2 cursor-pointer bg-green-500 rounded-full hover:border-opacity-100 hover:bg-white border border-green-600 fill-current text-white hover:text-green-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 3h5m0 0v5m0-5l-6 6M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="inline h-10 w-10 mr-5 p-2 cursor-pointer bg-green-500 rounded-full hover:border-opacity-100 hover:bg-white border border-green-600 fill-current text-white hover:text-green-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 3h5m0 0v5m0-5l-6 6M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
          />
        </svg>
      </div>
    </div>
  );
};