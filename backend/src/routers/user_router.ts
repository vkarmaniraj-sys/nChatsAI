import { Request, Response, Router } from "express";
import { createUser, loginuser } from "../handler/routes_handler/user_handler";
import { CreateSubscription, GetSubscription, GetSubscriptionById, UpdateSubscriptionById } from "../handler/routes_handler/Sub_handler";
const multer = require("multer");
import jwt from "jsonwebtoken";
require("dotenv").config();

const mymulter = multer();

const Urouter = Router();
const secratKey = process.env.SecratKey || "";

Urouter.post("", mymulter.none(), async (req: Request, res: Response) => {
  try {
    const userbodydata = req.body;

    const response = await createUser(userbodydata);

    res.status(200).send(response);
  } catch (err) {
    console.log("Router: Error While creating user", err);
    res.status(500).send({ error: "Error while creating user" });
  }
});

Urouter.get("", mymulter.none(), async (req: Request, res: Response) => {
  // const token = req.cookies.app_token;

  try {
    if (req.isAuthenticated && req.isAuthenticated()) {
    const { name, email, picture } = req.user as any;
    res.json({
      sessionId: req.sessionID,
      user: {
        name: name,
        email:email,
        picture: picture,
      },
    });
  } else {
    res.status(401).json({ message: "No active session" });
  }
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
});

Urouter.post('/logout',mymulter.none(), async (req:Request, res:Response)=>{
  try{
    console.log("in logtout");
    console.log("const token = req.cookies.app_token;"+req.cookies.app_token);
    res.clearCookie("app_token", {
        httpOnly: true,
        secure:true,
        sameSite: "none"
        // maxAge: 0 or expires: new Date(0) is implicitly handled by clearCookie().
    });
    res.status(200).json({ message: "Logged out" });
  }catch(err){
    const errorMessage = typeof err === "object" && err !== null && "message" in err ? (err as { message: string }).message : "Unknown error";
    res.status(500).json({ message: errorMessage });
  }
})

Urouter.post("/login", mymulter.none(), async (req: Request, res: Response) => {
  try {
    const userbodydata = req.body;

    const response = await loginuser(userbodydata);

    res.status(200).send(response);
  } catch (err) {
    console.log("Router: Error While creating user", err);
    res.status(500).send({ error: "Error while creating user" });
  }
});

Urouter.post("/subscribe", mymulter.none(), async (Req: Request, Res: Response) => {
try{
    const SubBody = Req.body;
    const response = await CreateSubscription(SubBody);
    Res.status(200).send({"message":response});
}catch(e){
    Res.status(500).send({"message":"Error whil Subsription"});
}
});

Urouter.get("/subscribe/:id", mymulter.none(), async (Req: Request, Res: Response) => {
try{
    const Id = Req.params.id;
    const response = await GetSubscriptionById(Id);
    Res.status(200).send({"message":response});
}catch(e){
    Res.status(500).send({"message":"Error whil Subsription"});
}
});

Urouter.get("/subscribe", mymulter.none(), async (Req: Request, Res: Response) => {
try{
    const Id = Req.params.id;
    const response = await GetSubscription();
    Res.status(200).send({"message":response});
}catch(e){
    Res.status(500).send({"message":"Error whil Subsription"});
}
});


Urouter.put("/subscribe/:id", mymulter.none(), async (Req: Request, Res: Response) => {
try{
    const body = Req.body;
    const Id = Req.params.id;
    const response = await UpdateSubscriptionById(Id,body);
    Res.status(200).send({"message":response});
}catch(e){
    Res.status(500).send({"message":"Error whil Subsription"});
}
});


Urouter.get("/newSession/", (req: any, res: any) => {
  const sessionId = req.query.sessionId as string;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const oldPassport = req.session.passport;
  const oldCustom = req.session.customField;


  // Force regenerate and override ID
  req.session.regenerate((err:any) => {

    try{

    if (err) {
      return res.status(500).json({ error: "Session regenerate failed" });
    }

    // 👇 Manually override session ID (hacky but works with store)
    (req as any).sessionID = sessionId;
    // (req.session as any).id = sessionId;

    // Restore old data
    if(oldPassport){
      req.session.passport = oldPassport;
    }
    if(oldCustom){
      req.session.customField = oldCustom;
    }

    // Save session explicitly
    req.session.save((saveErr:any) => {
      if (saveErr) {
        return res.status(500).json({ error: "Failed to save new session" });
      }
      res.status(200).send({ sessionId });
    });}
    catch(e){
      console.log("Error:error",e);
    }
  });
});

Urouter.get("/ActiveSession", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({
      sessionId: req.sessionID,        // whatever you stored
    });
  } else {
    res.status(401).json({ message: "No active session" });
  }
});


export default Urouter;
