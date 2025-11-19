import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import RoomType from './RoomType.js';
import Amenity from './Amenity.js';

const RoomTypeAmenity = sequelize.define('RoomTypeAmenity',{
    id: {type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    roomTypeId:{type:DataTypes.INTEGER,allowNull:false,references:{model:RoomType,key:'id'}},
    amenityId:{type:DataTypes.INTEGER,allowNull:false,references:{model:Amenity,key:'id'}},
},{
    timestamps:true,
    tableName:'room_type_amenity'
});
export default RoomTypeAmenity;