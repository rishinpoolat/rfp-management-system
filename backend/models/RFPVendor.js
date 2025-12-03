import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RFPVendor = sequelize.define('RFPVendor', {
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
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'vendors',
      key: 'id',
    },
  },
  sent_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  email_subject: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'rfp_vendors',
  timestamps: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['rfp_id', 'vendor_id'],
    },
  ],
});

export default RFPVendor;
