import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Proposal = sequelize.define('Proposal', {
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
  raw_email_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  delivery_timeline: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  payment_terms_offered: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  warranty_offered: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  additional_terms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parsed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'received',
    validate: {
      isIn: [['received', 'under_review', 'accepted', 'rejected']],
    },
  },
  ai_score: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100,
    },
  },
  ai_summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'proposals',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['rfp_id', 'vendor_id'],
    },
  ],
});

export default Proposal;
