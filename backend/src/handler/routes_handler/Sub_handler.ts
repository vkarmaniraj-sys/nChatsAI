import SubscriptionModel from "../../models/subscription_Model";

export const CreateSubscription = async (subBody: any) => {
  try {
    const sub = new SubscriptionModel({
      email: subBody.email,
      planName: subBody.planName,
      status: subBody.status,
      startDate: subBody.startDate,
      endDate: subBody.endDate,
      isAutoRenew: subBody.isAutoRenew,
    });

    const newsub = await sub.save();

    return newsub.toObject();
  } catch (err) {
    console.log("error while creating subscription");
    throw new Error("Error while creating subscription");
  }
};
export const GetSubscriptionById = async (id: any) => {
  try {
    const foundSub = await SubscriptionModel.findById(id);
    if (foundSub != null) {
      return foundSub;
    } else {
      return "No Found";
    }
  } catch (err) {
    console.log("error while creating subscription");
    throw new Error("Error while creating subscription");
  }
};
export const GetSubscription = async () => {
  try {
    const foundSub = await SubscriptionModel.find();
    if (foundSub != null) {
      return foundSub;
    } else {
      return "No Found";
    }
  } catch (err) {
    console.log("error while creating subscription");
    throw new Error("Error while creating subscription");
  }
};
export const UpdateSubscriptionById = async (Id: any, Body: any) => {
  try {
    const BodyData = {
      email: Body.email,
      planName: Body.planName,
      status: Body.status,
      startDate: Body.startDate,
      endDate: Body.endDate,
      isAutoRenew: Body.isAutoRenew,
    };

    const foundSub = await SubscriptionModel.findByIdAndUpdate(Id, BodyData);
    if (foundSub != null) {
      return foundSub;
    } else {
      return "No Found";
    }
  } catch (err) {
    console.log("error while creating subscription");
    throw new Error("Error while creating subscription");
  }
};
