import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { Headfoot } from "../../components/headfoot";

import { Component } from "react";


class Profile extends Component {



  constructor(props) {
    super(props);
    this.img = props.imgpath;
    this.state = {
      usernameForm: props.username,
      emailForm: props.email,
      passwordForm: null
    }
  }

  async checkEmail(email) {
    console.log("entrado en email");
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email)){
      return true;
    }
    else{
      toast.error("You must use a valid email.");
      return false;
    }
  }

  async checkPassword(passwd) {
    var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.:(),;])[A-Za-z\d@$!%*?&.:(),;]{7,25}$/;
    return passwd.match(passw);
  }

  async updateUser(credentials) {
    return fetch('http://' + window.location.host + '/update', {
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

  handleChanges = async (e) => {
    e.preventDefault();
    var userData = {
      sendName: null,
      sendEmail: null,
      sendPasswd: null
    };
    if (this.state.passwordForm) {
      if (await this.checkPassword(this.state.passwordForm)) {
        userData.sendPasswd = this.state.passwordForm;
        if (this.state.emailForm != this.props.email && await this.checkEmail(this.state.emailForm)) {
          userData.sendEmail = this.state.emailForm;
        }
        if (this.state.usernameForm != this.props.username) {
          userData.sendName = this.state.usernameForm;
        }
      }
      else {
        toast.error("The password must contain between 8 an 25 characters, lowercase and uppercase letters, numbers and special characters.");
      }
    }
    if (this.state.emailForm != this.props.email && await this.checkEmail(this.state.emailForm)) {
      userData.sendEmail = this.state.emailForm;
    }
    if (this.state.usernameForm != this.props.username) {
      userData.sendName = this.state.usernameForm;
    }
    const update = await this.updateUser(userData);
    if (update.error) {
      toast.error(update.error);
    }
    else {
      window.location.href = 'http://' + window.location.host + '/main';
    }


  }





  render() {
    return (
      <>
        <Headfoot user={this.state.usernameForm}>
          <div className="flex w-full h-screen ">
            <div className="flex w-2/5 my-auto mx-16 shadow rounded-md bg-vcom-blue overflow-hidden">
              <div className="mb-3 w-full" >
                <div className="mt-3 w-full">
                  <p className="text-4xl px-12 mt-8 font-bold text-black inline-block">PROFILE</p>
                  <div className="px-14 float-right mx-auto">
                    <Image src={this.img} className="rounded-full" alt="Picture of the author" width={100} height={100} />
                  </div>
                  <form action="profile" method="POST" className="w-3/4 inline-block" id="formLogin" >
                    <div className="mt-3">
                      <div className="px-12">
                        <label htmlFor="registerUsername" className="text-xl font-medium">
                          Username
                        </label>
                        <input
                          type="text"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                          value={this.state.usernameForm}
                          onChange={e => this.setState({ usernameForm: e.target.value })}
                        />

                      </div>
                      <div className="px-12">
                        <label htmlFor="registerEmail" className="text-xl font-medium">
                          Email
                        </label>
                        <input
                          type="text"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                          value={this.state.emailForm}
                          onChange={e => this.setState({ emailForm: e.target.value })}
                        />
                      </div>
                      <div className="px-12">
                        <label htmlFor="registerPassword" className="text-xl font-medium">
                          Password
                        </label>
                        <input
                          type="password"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
                          placeholder="************"
                          onChange={e => this.setState({ passwordForm: e.target.value })}
                        />
                      </div>
                    </div>
                  </form>
                </div>
                <div className="text-center mt-4">
                  <button type="button" className="btn-black" onClick={this.handleChanges}>
                    Save changes
                  </button>
                </div>
              </div>
            </div>
            <div>
              <ToastContainer
                position="top-right"
                autoClose={8000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                draggable={false}
                pauseOnHover={false}
              />
            </div>
          </div>
        </Headfoot>
      </>
    );
  }
};

export async function getServerSideProps(context) {
  const { req, res } = context;
  const user = JSON.parse(req.cookies.user).username;
  const email = JSON.parse(req.cookies.user).email;
  const img = JSON.parse(req.cookies.user).imgpath;


  return {
    props: { username: user, imgpath: img, email: email },
  };

}

export default Profile;
