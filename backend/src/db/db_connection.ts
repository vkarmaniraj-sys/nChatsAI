import mongoose from "mongoose";

const dbconnectionstring = process.env.mongoDBURL || 'mongodb+srv://nirajv0:root@all-ai.fumsp6k.mongodb.net/?retryWrites=true&w=majority&appName=All-ai';
const dbname = process.env.DatabaseName;

export const dbconnection = async ()=> {
  await mongoose.connect(dbconnectionstring);
}