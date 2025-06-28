import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { listUsers, signin, signout, signup } from "../../api/usersApi";

export default function UsersAuthAdmin() {
   const [users, setUsers] = useState([]);
   const [form, setForm] = useState({ name: "", username: "", password: "" });
   const [authMode, setAuthMode] = useState("signup"); // or "signin"
   const [currentUser, setCurrentUser] = useState(null);
   const [error, setError] = useState("");

   useEffect(() => {
      fetchUsers();
      const cookieUser = Cookies.get("user");
      if (cookieUser) setCurrentUser(JSON.parse(cookieUser));
   }, []);

   async function fetchUsers() {
      const { data, error } = await listUsers();
      if (!error) setUsers(data || []);
   }

   async function handleAuth(e) {
      e.preventDefault();
      setError("");
      if (authMode === "signup") {
         const { data, error } = await signup(form);
         if (error) setError(error.message || error);
         else
            setCurrentUser({
               id: data.id,
               name: data.name,
               username: data.username,
            });
      } else {
         const { data, error } = await signin(form);
         if (error) setError(error.message || error);
         else
            setCurrentUser({
               id: data.id,
               name: data.name,
               username: data.username,
            });
      }
      setForm({ name: "", username: "", password: "" });
      fetchUsers();
   }

   function handleSignout() {
      signout();
      setCurrentUser(null);
   }

   return (
      <div>
         <h2>Users Auth Admin</h2>
         {currentUser ? (
            <div>
               <p>
                  Signed in as: {currentUser.name} ({currentUser.username})
               </p>
               <button onClick={handleSignout}>Sign Out</button>
            </div>
         ) : (
            <form onSubmit={handleAuth}>
               {authMode === "signup" && (
                  <input
                     placeholder="Name"
                     value={form.name}
                     onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                     }
                  />
               )}
               <input
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) =>
                     setForm({ ...form, username: e.target.value })
                  }
               />
               <input
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                     setForm({ ...form, password: e.target.value })
                  }
               />
               <button type="submit">
                  {authMode === "signup" ? "Sign Up" : "Sign In"}
               </button>
               <button
                  type="button"
                  onClick={() => {
                     setAuthMode(authMode === "signup" ? "signin" : "signup");
                     setError("");
                  }}
               >
                  {authMode === "signup"
                     ? "Switch to Sign In"
                     : "Switch to Sign Up"}
               </button>
               {error && <div style={{ color: "red" }}>{error}</div>}
            </form>
         )}
         <h3>All Users</h3>
         <ul>
            {users &&
               users.map((user) => (
                  <li key={user.id}>
                     {user.name} ({user.username})
                  </li>
               ))}
         </ul>
      </div>
   );
}
