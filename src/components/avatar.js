export const Avatar = ({ src, sizex, sizey }) => {

  const sizeX = sizex ? 'w-' + sizex : 'w-11';
  const sizeY = sizey ? 'h-' + sizey : 'h-11';
  return (
    <img
      className={"object-cover mr-1 rounded-full " + sizeX + " " + sizeY}
      src={src}
      alt="Profile image"
    />
  );


}