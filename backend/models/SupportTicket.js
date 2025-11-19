import { DataTypes, UUIDV4 } from "sequelize";
import sequelize from "../config/db.js";

const SupportTicket = sequelize.define("SupportTicket", {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    subject: { type: DataTypes.STRING(255), allowNull: false },
    status: { type: DataTypes.ENUM("Waiting", "Assigned", "Active", "Closed"), defaultValue: "Waiting" },
    assignedTo: { type: DataTypes.INTEGER, allowNull: true }, 
}, {
    tableName: "support_tickets",
    underscored: true,
});

export default SupportTicket;
