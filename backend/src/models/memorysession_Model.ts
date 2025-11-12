import mongoose, { Model, Schema } from "mongoose";

interface IMemorySession extends mongoose.Document {
         Userid:string,
         Sessionid:string,
         Title:string,
         Messages: Array<any>;
}

const MemorySessionSchema = new mongoose.Schema(
  {
        Userid:{type:String,required:true},
        Sessionid: { type: String, required: true },
        Title: { type: String, required: true },
        Messages: { type: [Schema.Types.Mixed], default: [] }, 
  },
  {
    timestamps: true,
  }
);

const MemorySessionModel: Model<IMemorySession> = mongoose.model<IMemorySession>("MemorySession", MemorySessionSchema);

export default MemorySessionModel;
