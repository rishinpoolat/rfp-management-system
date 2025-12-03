import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RFPItem = sequelize.define('RFPItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  rfp_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rfps',
      key: 'id',
    },
  },
  item_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  specifications: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'rfp_items',
  timestamps: true,
  underscored: true,
  updatedAt: false,
});

export default RFPItem;
