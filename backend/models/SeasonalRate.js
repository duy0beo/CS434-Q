import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import RoomType from './RoomType.js';

const SeasonalRate = sequelize.define('SeasonalRate', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    startDate: {type: DataTypes.DATEONLY, allowNull: false},
    endDate: {type: DataTypes.DATEONLY, allowNull: false},
    multiplier: {type: DataTypes.DECIMAL(5, 2), allowNull: false},
    seasonName: {type: DataTypes.STRING, allowNull: false},
    roomTypeId: {type: DataTypes.INTEGER, allowNull: false, references: {model: RoomType, key: 'id'}},
}, {
  tableName: 'seasonal_rates',
  timestamps: true,
  indexes: [
        {
            unique: true,
            fields: ['employeeId', 'roleId']
        }
    ]
});
export default SeasonalRate;