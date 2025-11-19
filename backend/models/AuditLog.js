import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js'; // Assuming you have a User model defined

const AuditLog=sequelize.define('AuditLog',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    action:{type:DataTypes.STRING,allowNull:false},
    entity:{type:DataTypes.STRING,allowNull:false}, // e.g., User, Post, Comment, etc.
    entityId:{type:DataTypes.INTEGER,allowNull:false},
    userId:{type:DataTypes.INTEGER,allowNull:false, references:{model:User,key:'id'}},
    userType:{type:DataTypes.ENUM('Admin','Employee','User'),allowNull:false},
    details:{type:DataTypes.JSON,allowNull:true} // Optional field to store additional details about the action
},{
    timestamps:true,
    tableName:'audit_logs'
});
export default AuditLog;