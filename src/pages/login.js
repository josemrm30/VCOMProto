import Image from 'next/image'



const Login = () => {
    return (
        <>
            <div className="flex h-screen justify-center items-center">
                <div className="flex w-1/3 m-auto justify-center shadow rounded-md h-3/4 bg-vcom-blue overflow-hidden">
                    <form action="profile" method="POST" className="mb-3 w-full" id="formLogin">
                        <div className="mt-3 w-full">
                            <div className="flex text-center items-center justify-center">
                                <Image src="/ondas.png" alt="Picture of the author" width={150} height={150} />
                                <p className="text-4xl font-bold text-white filter drop-shadow-xl">VCOM</p>
                            </div>
                            <p className="text-4xl text-center font-bold text-black">LOGIN</p>
                            <hr className="mt-3 w-10/12 m-auto"></hr>
                            <div className="mt-3 h-full">
                                <div className="px-12">
                                    <label className="text-xl font-medium">Username</label>
                                    <input type="text" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" name="loginEmail" placeholder="Username" />
                                </div>
                                <div className="px-12">
                                    <label className="text-xl font-medium">Password</label>
                                    <input type="password" className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" name='loginPassword' placeholder="Password" />
                                </div>
                                <div className="px-12 text-center h-full">
                                    <button type="button" className="inline box-border h-full w-1/3 mt-3 mb-3 rounded-md font-normal text-white text-xl bg-vcom-buttons">Login</button>
                                </div>
                            </div>
                            <hr className="w-10/12 m-auto"></hr>
                            <div classname=" h-1/6">
                                <p>New to the app?</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Login;