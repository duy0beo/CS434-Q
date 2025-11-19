import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import Customer from './Customer.js';
import Booking from './Booking.js';

const Review=sequelize.define('Review',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    rating:{type:DataTypes.SMALLINT,allowNull:false, validate:{min:1,max:5}},
    comment:{type:DataTypes.TEXT,allowNull:true},
    reviewDate:{type:DataTypes.DATE(3),defaultValue:DataTypes.NOW,allowNull:false},
    customerId:{type:DataTypes.INTEGER,allowNull:false, references:{model:Customer,key:'id'}},
    bookingId:{type:DataTypes.INTEGER,allowNull:false, references:{model:Booking,key:'id'}, unique:true}  
},{
    timestamps:true,
    tableName:'review'
});


export default Review;