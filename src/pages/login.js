import Image from 'next/image'



const Login = () => {
    return (
        <>
            <div class="flex h-screen justify-center items-center">
                <div class="flex w-1/3 m-auto justify-center shadow rounded-md bg-vcom-blue overflow-hidden">
                    <form action="profile" method="POST" class="mb-3 w-full" id="formLogin">
                        <div class="mt-3 w-full">
                            <div class="flex text-center items-center justify-center ">
                                <Image src="/ondas.png" alt="Picture of the author" width={150} height={150} />
                                <p class="text-4xl font-bold text-white filter drop-shadow-xl">VCOM</p>
                            </div>
                            <p class="text-4xl text-center font-bold text-black">LOGIN</p>
                            <hr class="mt-3 w-10/12 m-auto"></hr>
                            <div class="mt-3">
                                <div class="px-12">
                                    <label class="text-xl font-medium">Username</label>
                                    <input type="text" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" name="loginEmail" placeholder="Username" />
                                </div>
                                <div class="px-12">
                                    <label class="text-xl font-medium">Password</label>
                                    <input type="password" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" name='loginPassword' placeholder="Password" />
                                </div>
                                <div class="px-12 text-center">
                                    <button type="button" class="inline box-border  w-1/3 mt-3 mb-3 rounded-md font-normal text-white text-xl bg-vcom-buttons">Login</button>
                                </div>
                            </div>
                            <hr class="w-10/12 m-auto"></hr>
                            <div>
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