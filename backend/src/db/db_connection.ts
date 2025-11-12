import mongoose from "mongoose";

const dbconnectionstring = process.env.mongoDBURL || 'mongodb://localhost:27017';
const dbname = process.env.DatabaseName;

export const dbconnection = async ()=> {
  await mongoose.connect(dbconnectionstring);
}