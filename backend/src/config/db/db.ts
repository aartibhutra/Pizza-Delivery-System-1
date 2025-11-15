import mongoose, { Types } from "mongoose";
import { optional } from "zod";

const UsersSchema = new mongoose.Schema({
    name : {type : String, required : true},
    userType : {type : String, enum : ["admin", "customer"], default : "customer"},
    
    mail : {type : String, required : true, unique : true},
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpiry: { type: Number },

    password : {type : String, required : true},
    resetToken: { type: String },
    resetTokenExpiry: { type: Number },
})

const PizzaSchema = new mongoose.Schema({
  title: { type: String, required : true },
  description: { type: String , optional : true},
  base : { type : Types.ObjectId, ref: 'PizzaBase', optional : true},
  sauce : {type : Types.ObjectId, ref: 'PizzaSauce', optional : true},
  cheese : {type : Types.ObjectId, ref: 'PizzaCheese', optional : true},
  veggies : {type : [Types.ObjectId], ref : 'PizzaVeggies', optional : true},
  price : {type : Number, default : 0},
  createdBy: { type: Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });

const status = ["Order Recieved", "In the Kitchen", "Sent to Delivery", "Delivered"]

const OrderSchema = new mongoose.Schema({//change
    userId : {type : Types.ObjectId, ref : 'User', required : true},
    status : {type : String, enum : status, default : status[0]},
    orders : [
        {
            pizza : {type : Types.ObjectId, ref : 'Pizza', required : true},
            quantity : {type : Number, required : true}
        }
    ],
    totalprice : {type : Number, default : 0}
})

const PizzaBaseSchema = new mongoose.Schema({
    name : {type : String, required : true},
    stock : {type : Number, default : 0},
    threshold : {type : Number, default : 20},
    price : {type : Number, default : 0}
})

const PizzaSauceSchema = new mongoose.Schema({
    name : {type : String, required : true},
    stock : {type : Number, default : 0},
    threshold : {type : Number, default : 20},
    price : {type : Number, default : 0}
})

const PizzaCheeseSchema =  new mongoose.Schema({
    name : {type : String, required : true},
    stock : {type : Number, default : 0},
    threshold : {type : Number, default : 20},
    price : {type : Number, default : 0}
})

const PizzaVeggiesSchema = new mongoose.Schema({
    name : {type : String, required : true},
    stock : {type : Number, default : 0},
    threshold : {type : Number, default : 20},
    price : {type : Number, default : 0}
})

export const User = mongoose.model("User", UsersSchema);
export const Pizza = mongoose.model("Pizza", PizzaSchema);
export const PizzaVeggies = mongoose.model("PizzaVeggies", PizzaVeggiesSchema);
export const PizzaBase = mongoose.model("PizzaBase", PizzaBaseSchema);
export const PizzaCheese = mongoose.model("PizzaCheese", PizzaCheeseSchema);
export const PizzaSauce = mongoose.model("PizzaSauce", PizzaSauceSchema);
export const Order = mongoose.model('Order', OrderSchema);