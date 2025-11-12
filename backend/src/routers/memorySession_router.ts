import express,{Router,Request,Response} from "express";
import { DeleteMemosySessionWithSessionId, GetMemorySessionWithSessionId, GetSessionMemoryWithId, UpdateMemorySession } from "../handler/routes_handler/memorySession_handler";
import { pushMessage } from "../utilis/message_buffer";

declare module 'express-session' {
  interface SessionData {
    passport?: { user: any };
    customField?: any;
  }
}

const MSRouter = Router();

MSRouter.get('/', async (req: Request, res: Response):Promise<void> => {
  try {
    console.log("CurrentUser:-", req.user);

    if (!req.user) {
      res.status(401).send({ message: "Not logged in" });
      return ;
    }

    const FoundMemory = await GetSessionMemoryWithId((req.user as any).id);

    res.status(200).send({
      message: "data found",
      data: { FoundMemory },
    });
  } catch (error: any) {
    console.error("Error while getting Memory:", error);
     res.status(500).send({
      message: "Error While Fetching Data",
      Error: error.message,
    });
  }
});

MSRouter.put('/:Sessionid',async (req:Request,res:Response):Promise<void>=>{
    try{
        const Sessionid = req.params.Sessionid;
        const {Messages} = req.body;
        const databody = {
            Userid:(req.user as any).id,
            Sessionid:Sessionid,
            Messages:Messages
        }
        console.log("databody",databody);
        console.log("CurrentUser:-",req.user);
        if (!Sessionid) {
           res.status(401).send({ message: "Session Id is required" });
           return;
        }
        const FoundMemory = await UpdateMemorySession(databody);
        
        res.status(200).send({message:"data updated",data:{FoundMemory}});
    }catch(error:any){
            console.log("error while Updating Memory");
            res.status(500).send({message:"Error While Updating Data",Error:error.message});
    }
});
MSRouter.delete('/:Sessionid',async (req:Request,res:Response)=>{
    try{
        const Sessionid = req.params.Sessionid;
        const databody = {
            Userid:(req.user as any).id,
            Sessionid:Sessionid,
        }
        console.log("databody",databody);
        if (!Sessionid) {
           res.status(401).send({ message: "Session Id is required" });
        }
        const FoundMemory = await DeleteMemosySessionWithSessionId(databody);
        
        res.status(200).send({message:"data Deleted",data:{FoundMemory}});
    }catch(error:any){
            console.log("error while Deleting Memory");
            res.status(500).send({message:"Error While Deleting Data",Error:error.message});
    }
});

MSRouter.get("/c/:Sessionid",async (req:Request,res:Response)=>{
    try{

        const Sessionid = req.params.Sessionid;
        const databody = {
            Userid:(req.user as any).id,
            Sessionid:Sessionid,
        }
        const FoundMemory:any =  await GetMemorySessionWithSessionId(databody);

        const SessionId = FoundMemory[0].Sessionid;
        const Messages = FoundMemory[0].Messages;

        Messages.map(async (value:any)=>{
          await pushMessage(SessionId,value);
        })

        console.log("FoundMemory",FoundMemory);

        res.status(200).send({message:"Found Session Data",data:{FoundMemory}});

    } catch(error:any){
            console.log("error while Updating Memory");
            res.status(500).send({message:"Error While Updating Data",Error:error.message});
    }
})

// MSRouter.get("/me", (req, res) => {
//   if (req.user) {
//     res.json({
//       sessionId: req.sessionID,        // whatever you stored
//     });
//   } else {
//     res.status(401).json({ message: "No active session" });
//   }
// });

// MSRouter.get("/newSession/", (req: any, res: any) => {
//   const sessionId = req.query.sessionId as string;
//   if (!sessionId) {
//     return res.status(400).json({ error: "sessionId is required" });
//   }

//   const oldPassport = req.session.passport;
//   const oldCustom = req.session.customField;


//   // Force regenerate and override ID
//   req.session.regenerate((err:any) => {

//     try{

//     if (err) {
//       return res.status(500).json({ error: "Session regenerate failed" });
//     }

//     // 👇 Manually override session ID (hacky but works with store)
//     (req as any).sessionID = sessionId;
//     // (req.session as any).id = sessionId;

//     // Restore old data
//     if(oldPassport){
//       req.session.passport = oldPassport;
//     }
//     if(oldCustom){
//       req.session.customField = oldCustom;
//     }

//     // Save session explicitly
//     req.session.save((saveErr:any) => {
//       if (saveErr) {
//         return res.status(500).json({ error: "Failed to save new session" });
//       }
//       res.status(200).send({ sessionId });
//     });}
//     catch(e){
//       console.log("Error:error",e);
//     }
//   });
// });

export default MSRouter;