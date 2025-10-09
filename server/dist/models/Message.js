
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";
import User from "./User";
class Message extends Model {
}
Message.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    senderId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    recipientId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true, // null = public message
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
},

    {
        sequelize,
        modelName: "Message",
        tableName: "messages",
        timestamps: true,
    });
// Define association
User.hasMany(Message, { foreignKey: "senderId", as: "messages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });
// each message can also belong to a recipient (for private chats)
Message.belongsTo(User, { foreignKey: "recipientId", as: "recipient" });
export default Message;
