import mongoose, { Model, Schema, Types } from "mongoose";

interface ISubscription extends mongoose.Document {
  email: string;
  planName: string;
  status?: "active" | "cancelled" | "expired" | "trial";
  startDate?: string;
  endDate?: string;
  isAutoRenew?: boolean;
}

const SubscriptionSchema = new mongoose.Schema(
  {
    email: { type:String, required: true },
    planName: { type: String, required: true }, // e.g., "Basic", "Pro"
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "trial"],
      default: "active",
    },
    startDate: { type: String, default: Date.now },
    endDate: { type: String },
    isAutoRenew: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const SubscriptionModel: Model<ISubscription> = mongoose.model<ISubscription>(
  "Subscription",
  SubscriptionSchema
);

export default SubscriptionModel;
