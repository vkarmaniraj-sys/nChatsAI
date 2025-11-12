import { cat } from "@xenova/transformers";
import MemorySessionModel from "../../models/memorysession_Model"
import { callLLMForSummary } from "../together_API";

export const CreateMemorySession = async (data:any) =>{
    try {
    console.log("IN CreateMemory", data);

    const { Userid, Sessionid, Title, Messages } = data;


    // Check if session already exists
    const existingSession = await MemorySessionModel.findOne({ Sessionid });
    if (existingSession) {
        console.log("Session already exists:", existingSession);
        return null; // Or return existingSession if you want
    }

        const SummarizedTitle = await callLLMForSummary(`
        Generate a short, catchy title (under 10 words) summarizing the main idea.
        Avoid punctuation unless necessary.
        
        Text:
        ${Title}
        `);

    // Create a new session
    const newMemory = new MemorySessionModel({
        Userid,
        Sessionid,
        Title: SummarizedTitle,
        Messages
    });

    const savedMemory = await newMemory.save();

    console.log("CreatedSessionMemory", savedMemory);
    return savedMemory;

} catch (err: any) {
    console.error("Error while creating new chat:", err.message);
    throw new Error("ERROR: While creating new Chat");
}

}

export const UpdateMemorySession = async (data:any) =>{
    try{
        console.log("IN UpdateMemory",data);
    const {Userid,Sessionid,Messages} = data;
    const UpdateMemory =  await MemorySessionModel.findOneAndUpdate(
        {Userid:Userid,Sessionid:Sessionid},
        {$push:{Messages:Messages}},
        {new : true}
    );

    console.log("Updated Memory",UpdateMemory);
    return UpdateMemory;
    }catch(err){
        console.log("error while Updating New chat",err);
        throw new Error("ERROR: While Update new Chat");
    }
}

export const GetSessionMemoryWithId = async (Userid:String)=>{
    try{
        const FoundMemory = await MemorySessionModel.find({Userid:Userid});
        // console.log("found Memory with session",FoundMemory);
        return FoundMemory;
    }catch(error){
        console.log("error while getting memory",error);
        throw new Error("ERROR: error while getting memory");
    }
}

export const GetMemorySessionWithSessionId = async (data:any)=>{
    try{
        const {Userid,Sessionid} = data;
        const FoundMemory = await MemorySessionModel.find({Userid:Userid,Sessionid:Sessionid});
        // console.log("found Memory with session",FoundMemory);
        return FoundMemory;
    }catch(error){
        console.log("error while getting memory",error);
        throw new Error("ERROR: error while getting memory");
    }
}
export const DeleteMemosySessionWithSessionId = async (data:any)=>{
    try {
        const {Userid,Sessionid} = data;
      const DeleteSession = await MemorySessionModel.deleteOne({Userid:Userid,Sessionid:Sessionid});
      console.log("DeleteSession:", DeleteSession);
      return DeleteSession
    } catch (err:any) {
      console.error("Error:", err.message);
      throw new Error("ERROR: Something went wrong");
    }
}