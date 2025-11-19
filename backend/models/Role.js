import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Role = sequelize.define('Role',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,allowNull:false,unique:true},
    permissions: {type:DataTypes.JSON,allowNull:false},

},{
    timestamps:true,
    tableName:'role'
});
export default Role;