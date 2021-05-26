import Image from "next/image";
import Particles from "react-particles-js";
import { TitleIcon } from "../components/titleicon";
import { useState } from "react";
import jwtDecode from "jwt-decode";

const Login = () => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  async function loginUser(credentials) {
    return fetch('http://' + window.location.host + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
      .then((response) => {
        return response.json();
      });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await loginUser({
      email,
      password
    });

    var token = user.token;
    var userData = jwtDecode(token).validation;

    window.localStorage.setItem("user", JSON.stringify(userData));
    window.location.href = 'http://' + window.location.host + '/main';
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    window.location.href = 'http://' + window.location.host + '/register';
  }

  return (
    <>
      <TitleIcon></TitleIcon>
      <div className="flex h-screen justify-center items-center">
        <div className="flex w-1/3 m-auto justify-center shadow rounded-md h-3/4 bg-vcom-blue overflow-hidden">
          <div className="mt-3 w-full">
            <div className="flex text-center items-center justify-center">
              <Image src="/ondas.png" alt="Picture of the author" width={150} height={150}/>
              <p className="text-4xl font-bold text-white filter drop-shadow-xl">VCOM</p>
            </div>
            <p className="text-4xl text-center font-bold text-black">LOGIN</p>
            <hr className="mt-3 w-10/12 m-auto"></hr>
            <form className="mb-3 w-full" id="formLogin" onSubmit={handleSubmit}>
              <div className="mt-3 h-full">
                <div className="px-12">
                  <label htmlFor="loginEmail" className="text-xl font-medium">Email</label>
                  <input
                    type="email"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                    id="loginEmail"
                    name="loginEmail"
                    placeholder="Email"
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="px-12">
                  <label htmlFor="loginPassword" className="text-xl font-medium">Password</label>
                  <input type="password" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                    id="loginPassword"
                    name="loginPassword"
                    placeholder="Password"
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <div className="px-12 text-center h-full">
                  <button type="submit" className="btn-black">
                    Login
                  </button>
                </div>
              </div>
            </form>
            <hr className="w-10/12 m-auto" />
            <div className="h-1/6">
              <p className="mt-2 text-center font-bold text-black">
                New to the app?
                </p>
              <div className="px-12 text-center h-full">
                <button type="button" className="btn-black-inverted" onClick={handleRegister}>
                  Register
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Particles
        id="particles-js"
        params={{
          particles: {
            number: {
              value: 80,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: "#94aaf7",
            },
            shape: {
              type: "polygon",
              stroke: {
                width: 0,
                color: "#000000",
              },
              polygon: {
                nb_sides: 5,
              },
            },
            opacity: {
              value: 0.8,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false,
              },
            },
            size: {
              value: 15,
              random: true,
              anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false,
              },
            },
            line_linked: {
              enable: false,
              distance: 150,
              color: "#000000",
              opacity: 0.4,
              width: 1,
            },
            move: {
              enable: true,
              speed: 6,
              direction: "top-left",
              random: false,
              straight: false,
              outMode: "out",
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detect_on: "window",
            events: {
              onhover: {
                enable: true,
                mode: "repulse",
              },
              onclick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 400,
                line_linked: {
                  opacity: 1,
                },
              },
              bubble: {
                distance: 400,
                size: 15,
                duration: 2,
                opacity: 1,
                speed: 3,
              },
              repulse: {
                distance: 100,
                duration: 0.4,
              },
              push: {
                particles_nb: 4,
              },
              remove: {
                particles_nb: 2,
              },
            },
          },
          retina_detect: true,
        }}
      />
    </>
  );
};

export default Login;
