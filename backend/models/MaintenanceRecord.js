import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Room from './Room.js';

const MaintenanceRecord=sequelize.define('MaintenanceRecord',{
    id:{type: DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    description:{type:DataTypes.TEXT,allowNull:false},
    startDate:{type:DataTypes.DATE(3),allowNull:false},
    endDate:DataTypes.DATE(3),
    status:{type:DataTypes.ENUM('Scheduled','In Progress','Completed'),defaultValue:'Scheduled',allowNull:false},
    cost:{type:DataTypes.DECIMAL(10,2),defaultValue:0.00,allowNull:false},
    notes:DataTypes.TEXT,
    roomDd:{type:DataTypes.INTEGER,allowNull:false,references:{model: Room,key:'id'}},
},{
    timestamps:true,
    tableName:'maintenance_records'
});
export default MaintenanceRecord;