import { DataTypes, UUIDV4 } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";
import SupportTicket from "./SupportTicket.js";

const SupportMessage = sequelize.define("SupportMessage", {
    id: { type: DataTypes.UUID, defaultValue: UUIDV4, primaryKey: true },
    content: { type: DataTypes.TEXT, allowNull: false },
}, {
    tableName: "support_messages",
    underscored: true,
});

export default SupportMessage;
