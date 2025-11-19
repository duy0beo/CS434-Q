import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Employee from './Employee.js';
import Role from './Role.js';

const EmployeeRole=sequelize.define('EmployeeRole',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    employeeId:{type:DataTypes.INTEGER,allowNull:false, references:{model:Employee,key:'id'}},
    roleId:{type:DataTypes.INTEGER,allowNull:false, references:{model:Role,key:'id'}},
},{
    timestamps:true,
    tableName:'employee_roles'
});
export default EmployeeRole;