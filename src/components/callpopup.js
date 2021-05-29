export const CallPopUp = ({ texto }) => {
  return (
    <div className="absolute bottom-0 right-10">
      <div className="flex flex-col p-8 bg-blue-400 shadow-md hover:shodow-lg rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 rounded-2xl p-3 border border-blue-200 text-blue-600 bg-blue-100"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div className="flex flex-col ml-3">
              <div className="text-black font-medium leading-none">
                {texto} is calling you...
              </div>
              <p className="text-sm text-gray-800 leading-none mt-1">
                Join call?
              </p>
            </div>
          </div>
          <button
            mat-icon-button=""
            class="flex-no-shrink bg-white px-5 ml-4 py-2 text-sm shadow-sm font-medium tracking-wider border-2 border-green-400 text-green-400 rounded-full hover:text-white hover:bg-green-500"
          >
            Join
          </button>
          <button
            mat-icon-button=""
            class="flex-no-shrink bg-white px-5 ml-4 py-2 text-sm shadow-sm font-medium tracking-wider border-2 border-red-400 text-red-400 rounded-full hover:text-white hover:bg-red-500"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
