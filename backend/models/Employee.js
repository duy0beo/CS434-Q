import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Employee=sequelize.define('Employee',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    userId:{type:DataTypes.INTEGER,allowNull:false,unique:true, references:{model:User,key:'id'}},
    position:{type:DataTypes.STRING,allowNull:false},
    department:{type:DataTypes.ENUM('HR','Engineering','Sales','Marketing'),allowNull:false},
    hireDate:{type:DataTypes.DATEONLY,allowNull:false},
},{
    timestamps:true,
    paranoid:true,
    tableName:'employee'
});
export default Employee;