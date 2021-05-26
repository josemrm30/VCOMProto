import Image from "next/image";
import { Component } from "react";
import Particles from "react-particles-js";
import { TitleIcon } from "../components/titleicon";

class Unauthorized extends Component {

    async handleLogin() {
      window.location.href = 'http://' + window.location.host + '/login';
    }
    async handleRegister(e) {
      window.location.href = 'http://' + window.location.host + '/register';
    }

    render(){
      return (
        <>
          <TitleIcon></TitleIcon>
          <div className="flex h-screen justify-center items-center">
            <div className="flex w-1/3 m-auto justify-center shadow rounded-md  bg-vcom-blue overflow-hidden">
              <div className="mt-3 w-full">
                <div className="flex text-center items-center justify-center">
                  <Image src="/ondas.png" alt="Picture of the author" width={150} height={150}/>
                  <p className="text-4xl font-bold text-white filter drop-shadow-xl">VCOM</p>
                </div>
                <p className="text-4xl text-center font-bold text-black">Acceso Denegado</p>
                <hr className="mt-3 w-10/12 m-auto"/>
                <div className="mb-3 w-full">
                  <div className="mt-3 h-full">
                    <div className="px-12 text-center h-full">
                      <p className="mt-2 text-center font-bold text-xl text-black">
                        ERROR: Intenta volver a iniciar sesión
                      </p>
                      <button type="button" className="btn-black" onClick={this.handleLogin}>
                        Login
                      </button>
                    </div>
                  </div>
                </div>
                <hr className="w-10/12 m-auto" />
                <div className="h-1/6">
                  <p className="mt-2 text-center font-bold text-black">
                    New to the app?
                  </p>
                  <div className="px-12 text-center h-full mb-4">
                    <button type="button" className="btn-black-inverted" onClick={this.handleRegister}>
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
      )
    };
};

export default Unauthorized;