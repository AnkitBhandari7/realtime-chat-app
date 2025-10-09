import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import User from "./User";

 //Interfaces

export interface IMessageAttributes {
  id: number;
  content: string;
  senderId: number;
  recipientId?: number | null;   //  new field
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessageCreationAttributes
  extends Optional<IMessageAttributes, "id" | "createdAt" | "updatedAt"> { }


 // Model class

class Message
  extends Model<IMessageAttributes, IMessageCreationAttributes>
  implements IMessageAttributes {
  public id!: number;
  public content!: string;
  public senderId!: number;
  public recipientId!: number | null;   // ✅ new field
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}


 //Model definition
 
Message.init(
  {
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
      // new column for private messaging
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,          // null = public message
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
  }
);


 // Associations
 
User.hasMany(Message, { foreignKey: "senderId", as: "messages" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

//  each message optionally belongs to one recipient (private chat)
Message.belongsTo(User, { foreignKey: "recipientId", as: "recipient" });

export default Message;