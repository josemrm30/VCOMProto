import { FriendElement, FriendRequest, FriendRequestTextBox } from "../../components/friend";
import { Headfoot } from "../../components/headfoot";
import { useRouter } from "next/router";
import do_query from "../../api/db";
import FriendEntry from "../../utils/friend_entry";

const Friends = (props) => {
  const router = useRouter();

  const refresh = () => {
    router.replace(router.asPath);
  };

  return (
    <Headfoot>
      <div class="lg:flex block flex-row w-full mx-auto mt-1">
        <div className="block mx-1 p-5 lg:w-3/5 container-bg">
          <p className="text-3xl font-bold">Your friends</p>
          <hr className="w-full my-1" />
          {Object.entries(props.friendlist).map(([id, friend]) => {
            console.log(friend);
            return <FriendElement key={id} friend={friend} />;
          })}
        </div>
        <div className="block mx-1 lg:w-2/5 lg:mt-0 mt-1">
          <div className="block p-5 container-bg">
            <p className="text-3xl font-bold">Add friends</p>
            <hr className="w-full my-1" />
            <p>
              Type the username of your friend to add it! Your friend will have
              to accept your request!
            </p>
            <FriendRequestTextBox />
          </div>
          <div className="block mt-1 p-5 container-bg">
            <p className="text-3xl font-bold">Friendship requests</p>
            <hr className="w-full my-1" />
            {Object.entries(props.petitionlist).map(([id, petition]) => {
              return <FriendRequest key={id} friend={petition} />;
            })}
          </div>
        </div>
      </div>
    </Headfoot>
  );
};
export async function getServerSideProps(context) {
  const { req, res } = context; //Obtener request y response
  const user = req.cookies.username; //Obtener username
  try {
    const amigos = await do_query({
      query:
        "SELECT * FROM friend WHERE accepted = 1 AND (user1 = ? OR user2 = ?)",
      values: [user, user],
    });
    var amigosarr = [];
    for (const elem in amigos) {
      const amigo = amigos[elem];
      console.log(amigo);
      var nickfriend = amigo.user1 == user ? amigo.user2 : amigo.user1;
      amigosarr.push(
        new FriendEntry(amigo.id, nickfriend, amigo.since, amigo.accepted)
      );
    }
    console.log(amigosarr);
    const solicitudes = await do_query({
      query:
        "SELECT * FROM friend WHERE accepted = 0 AND (user1 = ? OR user2 = ?)",
      values: [user, user],
    });

    var solarr = [];
    for (const elem in solicitudes) {
      var nickfriend =
        solicitudes[elem].user1 == user
          ? solicitudes[elem].user2
          : solicitudes[elem].user1;
      solarr.push(
        new FriendEntry(
          solicitudes[elem].id,
          nickfriend,
          solicitudes[elem].since,
          solicitudes[elem].accepted
        )
      );
    }

    const friendlist = await JSON.parse(JSON.stringify(amigosarr));
    const petitionlist = await JSON.parse(JSON.stringify(solarr));
    return {
      props: { friendlist: friendlist, petitionlist: petitionlist },
    };
  } catch (err) {
    console.log(err);
  }
}

export default Friends;