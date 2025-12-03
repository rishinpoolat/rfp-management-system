import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RFP = sequelize.define('RFP', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  raw_input: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  budget: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  payment_terms: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  warranty_requirement: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'draft',
    validate: {
      isIn: [['draft', 'sent', 'active', 'closed', 'cancelled']],
    },
  },
}, {
  tableName: 'rfps',
  timestamps: true,
  underscored: true,
});

export default RFP;
