import mongoose, { Model } from "mongoose";

interface IUser extends mongoose.Document {
    // sub: '103186626245417430431',
    // name: 'Neeraj_V',
    // given_name: 'Neeraj_V',
    // picture: 'https://lh3.googleusercontent.com/a/ACg8ocJzteSawzuxU0MNdcVAyhFe7N-BQwmAwNkavsPqX4HiqzYxlkJr=s96-c',
    // email: 'nirajv217@gmail.com',
    // email_verified: true
         id:string,
         name:string,
         given_name:string,
         picture:string,
         email:string,
         email_verified:Boolean,
}

const UserSchema = new mongoose.Schema(
  {
         id:String,
         name:String,
         given_name:String,
         picture:String,
         email:String,
         email_verified:Boolean,
  },
  {
    timestamps: true,
  }
);

const UserModel: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
