import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Amenity=sequelize.define('Amenity',{
    id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING(255),unique:true, allowNull:false},
    description:DataTypes.TEXT,
},{
    tableName:'amenities',
    timestamps:true,
});
export default Amenity;