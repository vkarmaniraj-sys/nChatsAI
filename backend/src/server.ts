// declare module 'cookie-parser';

import express, { Request, Response ,RequestHandler } from "express";
import http from "http";
import { Server } from "socket.io";
import { getAIResponse } from "./handler/together_API";
import { addUserSocket, removeUserSocket } from "./handler/socket_handler";
import Urouter from "./routers/user_router";
import { dbconnection } from "./db/db_connection";
import { Pinecone } from "@pinecone-database/pinecone";
import cookieParser from "cookie-parser";
import session, { SessionOptions, Session } from "express-session";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

require("dotenv").config();

import {
  embeidingtranform,
  run,
  searchText,
  storeText,
} from "./vector-db/pinecone_vector";
import {
  createUser,
  findUserById,
} from "./handler/routes_handler/user_handler";
import { connectredis, redis } from "./redish-connect/redis-tools";
import MSRouter from "./routers/memorySession_router";
import { AuthGuard } from "./services/AuthGaurd";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// declare module "express-session" {
//   interface SessionData {
//     Userid?: string;
//     user?: any; // Add this line to allow 'user' property on session
//     passport?: any; // Add this line to allow 'passport' property on session
//   }
// }

declare module "socket.io" {
  interface Socket {
    TokenuserId?: any;
  }
}

// Extend IncomingMessage to include session property for TypeScript
// import type { Session } from "express-session";
import { JsonWebTokenError } from "jsonwebtoken";

declare module "http" {
  interface IncomingMessage {
    session?: Session & Partial<session.SessionData>;
    CustomSessionID?: string;
    user?: any; // Add this line to fix the error
    res?: any;
  }
}

// GoogleOAuth
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// GoogleOAuth

require("dotenv").config();
const app = express();
const server = http.createServer(app);
const cors = require("cors");
const port = process.env.PORT || 3000;

// app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
const sessionConfig: session.SessionOptions = {
  secret: "MYsecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false,
    httpOnly: true,
  },
  genid: (req: any) => {
    return req.CustomSessionID || uuidv4();
  }
};

// Explicitly cast as RequestHandler to fix TS2769
const sessionMiddleware: RequestHandler = session(sessionConfig);


app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());

const YOUR_GOOGLE_CLIENT_ID = process.env.YOUR_GOOGLE_CLIENT_ID;
const YOUR_GOOGLE_CLIENT_SECRET = process.env.YOUR_GOOGLE_CLIENT_SECRET;
const Frontend_URl = process.env.FRONTEND_URL;
const secratKey = process.env.SecratKey || "FHIDKSIUEOF";

passport.use(
  new GoogleStrategy(
    {
      clientID: YOUR_GOOGLE_CLIENT_ID,
      clientSecret: YOUR_GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google",
    },
    async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        let user = await findUserById(profile._json.sub);

        if (!user) {
          const userData = {
            id: profile._json.sub,
            name: profile._json.name,
            given_name: profile._json.given_name,
            picture: profile._json.picture,
            email: profile._json.email,
            email_verified: profile._json.email_verified,
          };
          user = await createUser(userData);
          await storeText(user.id, "my name is " + user.name);
          await storeText(user.id, "my email is " + user.email);
        }

        // Passport will call serializeUser with this `user`
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user: any, done: any) => {
  console.log("Google user data:", user);

  // Only pick plain data
  const payload = {
    id: user.id,
    name: user.name,
    given_name: user.given_name,
    picture: user.picture,
    email: user.email,
    email_verified: user.email_verified,
  };

const token = jwt.sign(
  payload,
  (process.env.SecratKey || 'FHIDKSIUEOF') as string,
  { expiresIn: "1h" }
);
  
  done(null, token); // store JWT in session
});

// Deserialize: how to get user object from session
passport.deserializeUser(async (token: any, done: any) => {
  try {
    console.log("in deserilizeUser");
    const user = jwt.verify(token, process.env.SecratKey || 'FHIDKSIUEOF');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const pc = new Pinecone({
  apiKey:
    process.env.pinecone_db_key ||
    "pcsk_41NUFz_KZrAgWgFhkdczp1Yh7QDXFbPKSj49Stu5aLoRGGCFsnFffMvzZNEMqRhc7DkCzY",
});
const index = pc.index("all-ai");

// console.log("index", index);

app.use(
  cors({
    origin: "http://localhost:5173", // explicitly allow frontend
    credentials: true,
  })
);
app.use(express.json());

app.use("/user", Urouter);
app.use("/sm", AuthGuard, MSRouter);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
  async (req: Request, res: Response) => {
    res.redirect(Frontend_URl || "http://localhost:5173/");
  }
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("in callback current uesr loginein", req);

    res.redirect(Frontend_URl || "http://localhost:5173/"); // or wherever in frontend
  }
);

const io = new Server(server, {
  cors: { origin: Frontend_URl, credentials: true },
});

// io.use((socket, next) => {
//   try {
//     // --- Step 1: Inject sessionId into request object ---
//     const { sessionId } = socket.handshake.query;

//     console.log("CurrentSocketId", sessionId);
//     if (sessionId) {
//       // drop old cookie so express-session doesn't override
//       // delete socket.request.headers.cookie;
//       (socket.request as any).sessionID = sessionId;
//       // (socket.request as any).query = { sessionId };
//     }

//     // --- Step 2: Run express-session on socket.request ---
//     sessionMiddleware(socket.request as any, {} as any, (err: any) => {
//       //   if (err) return next(err);

//       //   // ✅ Now socket.request.session is available
//       //   console.log("Session loaded:");

//       //   const Sessionid = (socket.request as any).sessionID;
//       // console.log("Final SessionId:", Sessionid);
//       if (sessionId) {
//         // drop old cookie so express-session doesn't override
//         // delete socket.request.headers.cookie;
//         (socket.request as any).sessionID = sessionId;
//         // (socket.request as any).query = { sessionId };
//       }

//       console.log(
//         "Socket connected with sessionID:",
//         (socket.request as any).sessionID
//       );
//       console.log("Session object:", (socket.request as any).session);

//       //   // --- Step 3: Parse cookies for JWT ---
//       // const cookies = socket.handshake.headers.cookie;
//       // if (!cookies) return next(new Error("No cookies found"));

//       // const parsedCookies = cookie.parse(cookies);
//       // const token = parsedCookies["app_token"];
//       // if (!token) return next(new Error("No app_token cookie"));

//       // const decoded = jwt.verify(token, secratKey) as { sub: string };

//       // // Attach decoded user to socket
//       // (socket as any).TokenuserId = decoded.sub;

//       // console.log("Socket authenticated:", decoded.sub);

//       next();
//     });
//   } catch (err) {
//     console.error("Socket auth error:", err);
//     next(new Error("Authentication error"));
//   }
// });

io.use((socket, next) => {
  sessionMiddleware(socket.request as any, {} as any, (err: any) => {
    if (err) {
      return next(err);
    }

    // Now session is available
    console.log("session loaded:", socket.request.session);

    // If user is logged in using passport on HTTP routes, restore them here
    passport.initialize()(socket.request as any, {} as any, () => {
      passport.session()(socket.request as any, {} as any, () => {
        console.log("socket data user middleware", socket.request.user);
        next();
      });
    });

  });
});


let userId: any;

connectredis();

dbconnection()
  .then((data) => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log("err", err);
    console.log("erro while connecting db");
  });

io.on("connection", (socket) => {
  const session = socket.request.session;
  console.log("Socket connected with sessionID:", session?.id);

  console.log("A client connected:", socket.id);

  socket.emit("current-session", { sessionID: session?.id });

  // req.session.sessionId = req.handshake.query.sessionId;
  // req.session.save();

  userId = socket.id;

  socket.setMaxListeners(100); // max hundrad lisner

  addUserSocket(socket.id, socket);

  // socket.on()

  socket.on("input", (data) => {
    const oldPassport = socket.request.session?.passport;
    console.log("oldPassport in input", oldPassport);
    getAIResponse(socket, data);
  });

  socket.on("create-custom-session", (data) => {
    const CustomSessionID = data.sessionID;
    const oldUser = socket.request.session?.user || socket.request?.user;
    const oldPassport = socket.request.session?.passport;
    console.log("oldPassport", oldPassport);

    session?.destroy((err) => {
      if (err) {
        console.log("Error deploying sesion", err);
        socket.emit("Error in socket");
        return;
      }

      socket.request.CustomSessionID = CustomSessionID;

      sessionMiddleware(socket.request as any, {} as any, () => {
  console.log(
    "oldPassport && socket.request.session",
    oldPassport && socket.request.session
  );

  console.log("socket.request.session", socket.request.session);

  if (oldPassport && socket.request.session) {
    socket.request.session.passport = oldPassport;
    console.log("old passport restored", socket.request.session.passport);
  }

  socket.request.session?.save((err: any) => {
    if (err) {
      console.log("error while saving sessionData");
      socket.emit("session-error", { message: "Failed to save session" });
      return;
    }

    passport.session()(socket.request as any, {} as any, () => {
      console.log("Custom session created:", {
        sessionID: socket.request.session?.id,
        user: socket.request.user,
      });

      socket.emit("session-updated", {
        sessionID: socket.request.session?.id,
        user: socket.request.user || null,
        message: "New session created with custom ID",
      });
    });
  });
});

    });
  });

  socket.on("test", (data) => {
    // console.log("test input");
    console.log("data", data);
  });

  socket.on("disconnect", () => {
    if (userId) removeUserSocket(userId);
    console.log(`User ${userId} disconnected`);
    console.log("Client disconnected:", socket.id);
  });
});

app.get("", (req, res) => {
  res.status(200).send({ message: "get request is working" });
});

// embeidingtranform().then(()=>{
// run().then(()=>{
//   //  storeText("4","i am graduated from asmita college");
//    searchText("where i studied");
// }).catch(err=>{
//   console.error("Error:", err);
// })
// }).catch(err => {
//   console.error('Error:', err);
// });

server.listen(3000, "0.0.0.0", () => {
  console.log("Socket server running on http://localhost:3000");
});