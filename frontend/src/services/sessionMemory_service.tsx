import axios from "axios";

const BackendLink = import.meta.env.VITE_API_BackendBaseUrl;

export const GetSessionMemories = async () => {
  try {
    const res = await axios.get(`${BackendLink}/sm`, {
      withCredentials: true
    });
    
    return res.data; 
  } catch (err) {
    console.error("Error fetching user info:", err);
    return null;
  }
};

type sessionData = {
  Sessionid:string,
}

export const GetSessionMemoryWithSessionId = async (data:sessionData) => {
  try {
    const {Sessionid} = data;
    const res = await axios.get(`${BackendLink}/sm/c/${Sessionid}`, {
      withCredentials: true
    });
    
    return res.data; 
  } catch (err) {
    console.error("Error fetching user info:", err);
    return null;
  }
};

export const DeleteSessionMemoryWithSessionId = async (data:sessionData) => {
  try {
    const {Sessionid} = data;
    const res = await axios.delete(`${BackendLink}/sm/${Sessionid}`, {
      withCredentials: true
    });
    
    return res.data; 
  } catch (err) {
    console.error("Error deleting user info:", err);
    return null;
  }
};
export const SetNewSessionInHTTP = async(SessionId:string)=>{
  try {
    const res = await axios.get(`${BackendLink}/user/newSession?sessionId=${SessionId}`, {
      withCredentials: true
    });
    
    return res.data; 
  } catch (err) {
    console.error("Error fetching user info:", err);
    return null;
  }
}

export const GetCurrentActiveSession = async ()=>{
    try {
    const res = await axios.get(`${BackendLink}/user/ActiveSession`, {
      withCredentials: true
    });
    
    return res.data; 
  } catch (err) {
    console.error("Error fetching user info:", err);
    return null;
  }
}

// type MemoryUpdateData = {
//   Sessionid:string,
//   Messages:object
// }

// export const UpdateSessionMemoryWithId = async (data: MemoryUpdateData) => {
//   try {
//     const {Sessionid,Messages} = data;
//     console.log("data",data);
//     const res = await axios.put(`${BackendLink}/sm/${Sessionid}`,Messages, {
//       withCredentials: true
//     });
    
//     return res.data; 
//   } catch (err) {
//     console.error("Error fetching user info:", err);
//     return null;
//   }
// };