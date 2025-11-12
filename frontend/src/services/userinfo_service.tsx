import axios from "axios";

const BackendLink = import.meta.env.VITE_API_BackendBaseUrl;

export const GoogleUserInfo = async () => {
  try {
    const res = await axios.get(`${BackendLink}/user`, {
      withCredentials: true
    });
    
    return res.data; 
  } catch (err) {
    console.error("Error fetching user info:", err);
    return null;
  }
};

export const LogOutUser = async () =>{
   try{
    const res = await axios.post(`${BackendLink}/user/logout`,{},{
        withCredentials: true
    });
    return res.data;
   }catch(err){
    console.log("error while logout",err);
   }
}