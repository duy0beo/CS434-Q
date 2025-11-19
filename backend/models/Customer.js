import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Customer = sequelize.define('Customer', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userId: {type: DataTypes.INTEGER, allowNull: false, references: {model: 'users', key: 'id'}},
    address: DataTypes.STRING(255),
    city: DataTypes.STRING(255),
    country: DataTypes.STRING(255),
    idNumber: DataTypes.STRING(255),
}, {
    tableName: 'customers',
    timestamps: true,
});

export default Customer;