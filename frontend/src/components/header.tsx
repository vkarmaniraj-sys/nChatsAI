import { GoogleUserInfo, LogOutUser } from "../services/userinfo_service";

import { useEffect, useState } from "react";

function Header() {

  const [UserInfo, setUserInfo] = useState<null | { picture: string; name: string }>(null);

  useEffect(() => {
    GoogleUserInfo()
      .then((data) => {
        console.log("google User Info", data);
        setUserInfo(data);
      })
      .catch(() => {
        setUserInfo(null);
      });
  }, []);

   const LogoutUser = () =>{
      LogOutUser().then((data)=>{
        console.log("logoutuser",data);
         alert(data.message);
         window.location.href = "http://localhost:5173/";
      }).catch((err)=>{
          alert(err.message);
          console.log("error while logout");
      })
   }

   const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
    // Change to your backend URL in production
  };

  return (
<div className="flex p-2 text-black-600 justify-between min-w-screen">
  <div className="flex justify-center items-center text-2xl font-bold">
    All.ai
  </div>

  {UserInfo == null ? (
    <div>
      <button  className="text-black" onClick={handleLogin}>Sign in</button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <img src={UserInfo.picture} alt="profile" className="w-8 h-8 rounded-full" />
      <h3>{UserInfo.name}</h3>
      <button onClick={LogoutUser} >LogOut</button>
    </div>
  )}
</div>)

}

export default Header;