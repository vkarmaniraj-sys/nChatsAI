import { error } from "console";
import UserModel from "../../models/user_Model";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

export const createUser = async (bodydata: any) => {
  try {
    // const hashedpassword = await bcrypt.hash(bodydata.passwordhash, 10); // hass password

    const user = new UserModel({
      id : bodydata.id,
      name : bodydata.name,
      given_name : bodydata.given_name,
      picture : bodydata.picture,
      email : bodydata.email,
      email_verified: bodydata.email_verified
    });
    const addeduser = await user.save(); // user added

    return addeduser;
  } catch (err) {
    console.log("error in user creation", err);
    throw new Error("Error while Creating user");
  }
};
export const loginuser = async (bodydata: any) => {
  try {
    const userfound: any = await UserModel.findOne({ email: bodydata.email });
    let token: any;
    if (bodydata.email != "" && bodydata.passwordhash != "") {
      if (userfound != null) {
        console.log("user found", userfound);
        const ismatched = await bcrypt.compare(
          bodydata.passwordhash,
          userfound.passwordhash
        );

        if (ismatched) {
          token = await jwt.sign(bodydata, process.env.SecratKey, {
            expiresIn: "1h",
          });

          return { message: "login successfull", token: token };
        } else {
          return { message: "password incorrect" };
        }
      } else {
        return { message: "No User found with email" };
      }
    } else {
      return { message: "all field are required" };
    }
  } catch (err) {
    console.log("error while login user", err);
    throw new Error("Error while Login User");
  }
};
export const findUserById = async (id:any) =>{
    const userfound: any = await UserModel.findOne({id:id});
    return userfound;
}
