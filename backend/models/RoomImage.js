import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Room from './Room.js';

const RoomImage = sequelize.define('RoomImage', {
    id: {type:DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    imageUrl: {type: DataTypes.STRING, allowNull: false},
    roomId: {type: DataTypes.INTEGER, references: {model: Room, key: 'id'}, allowNull: false},
}, {
    timestamps: true,
    tableName: 'room_image'
});
export default RoomImage;