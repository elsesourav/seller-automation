import { useEffect, useState } from "react";
import { signup, signin, signout } from "../../api/usersApi";
import Cookies from "js-cookie";
import CustomAlert from "../CustomAlert";

export default function AccountContent() {
   const [mode, setMode] = useState("login"); // 'login' | 'register'
   const [form, setForm] = useState({
      username: "",
      password: "",
      name: "",
      confirmPassword: "",
   });
   const [user, setUser] = useState(null);
   const [alert, setAlert] = useState(null);
   const [loading, setLoading] = useState(false);
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

   // On mount, check cookie for user
   useEffect(() => {
      const cookieUser = Cookies.get("user");
      if (cookieUser) setUser(JSON.parse(cookieUser));
   }, []);

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setAlert(null);
      try {
         const { data, error } = await signin({
            username: form.username,
            password: form.password,
         });
         if (error) throw new Error(error);
         setUser(data);
         setAlert({ type: "success", message: "Login successful!" });
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   };

   const handleRegister = async (e) => {
      e.preventDefault();
      if (form.password !== form.confirmPassword) {
         setAlert({ type: "error", message: "Passwords do not match." });
         return;
      }
      setLoading(true);
      setAlert(null);
      try {
         const { data, error } = await signup({
            name: form.name,
            username: form.username,
            password: form.password,
         });
         if (error) throw new Error(error);
         setUser(data);
         setAlert({
            type: "success",
            message: "Account created! You are now logged in.",
         });
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   };

   const handleLogout = () => {
      signout();
      setUser(null);
      setForm({ username: "", password: "", name: "", confirmPassword: "" });
      setAlert({ type: "info", message: "Logged out." });
   };

   return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
         <h1 className="text-2xl font-bold mb-4 text-white">Account</h1>
         {alert && (
            <CustomAlert
               type={alert.type}
               message={alert.message}
               onClose={() => setAlert(null)}
            />
         )}
         <div className="flex flex-col items-center justify-center w-full">
            {user ? (
               <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 flex flex-col items-center w-full max-w-xs">
                  <div className="text-lg text-white mb-2 text-center">
                     Welcome,{" "}
                     <span className="font-semibold">
                        {user.name || user.username}
                     </span>
                  </div>
                  <div className="text-gray-400 text-sm mb-4 text-center">
                     Username: {user.username}
                  </div>
                  <button
                     onClick={handleLogout}
                     className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium cursor-pointer"
                  >
                     Logout
                  </button>
               </div>
            ) : (
               <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 w-full max-w-xs flex flex-col items-center">
                  <div className="flex justify-center mb-4 w-full">
                     <button
                        className={`px-4 py-2 rounded-l-lg font-medium transition-all duration-200 cursor-pointer ${
                           mode === "login"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                              : "bg-gray-700 text-gray-300"
                        }`}
                        onClick={() => setMode("login")}
                        type="button"
                     >
                        Signin
                     </button>
                     <button
                        className={`px-4 py-2 rounded-r-lg font-medium transition-all duration-200 cursor-pointer ${
                           mode === "register"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                              : "bg-gray-700 text-gray-300"
                        }`}
                        onClick={() => setMode("register")}
                        type="button"
                     >
                        Signup
                     </button>
                  </div>
                  <form
                     onSubmit={mode === "login" ? handleLogin : handleRegister}
                     className="flex flex-col gap-4 w-full"
                  >
                     {mode === "register" && (
                        <input
                           type="text"
                           name="name"
                           placeholder="Full Name"
                           value={form.name}
                           onChange={handleChange}
                           className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                           required
                        />
                     )}
                     <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                     />
                     <div className="relative">
                        <input
                           type={showPassword ? "text" : "password"}
                           name="password"
                           placeholder="Password"
                           value={form.password}
                           onChange={handleChange}
                           className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10"
                           required
                        />
                        <button
                           type="button"
                           className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                           onClick={() => setShowPassword((v) => !v)}
                           tabIndex={-1}
                        >
                           {showPassword ? (
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 className="h-5 w-5"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 stroke="currentColor"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                 />
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                 />
                              </svg>
                           ) : (
                              <svg
                                 xmlns="http://www.w3.org/2000/svg"
                                 className="h-5 w-5"
                                 fill="none"
                                 viewBox="0 0 24 24"
                                 stroke="currentColor"
                              >
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592m3.31-2.687A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                 />
                                 <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3l18 18"
                                 />
                              </svg>
                           )}
                        </button>
                     </div>
                     {mode === "register" && (
                        <div className="relative">
                           <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              placeholder="Confirm Password"
                              value={form.confirmPassword}
                              onChange={handleChange}
                              className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full pr-10"
                              required
                           />
                           <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              tabIndex={-1}
                           >
                              {showConfirmPassword ? (
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                 </svg>
                              ) : (
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.223-3.592m3.31-2.687A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M3 3l18 18"
                                    />
                                 </svg>
                              )}
                           </button>
                        </div>
                     )}
                     <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-60 cursor-pointer"
                     >
                        {loading
                           ? mode === "login"
                              ? "Logging in..."
                              : "Creating..."
                           : mode === "login"
                           ? "Login"
                           : "Create Account"}
                     </button>
                  </form>
               </div>
            )}
         </div>
      </div>
   );
}
