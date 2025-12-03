import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProposalItem = sequelize.define('ProposalItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'proposals',
      key: 'id',
    },
  },
  rfp_item_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'rfp_items',
      key: 'id',
    },
  },
  item_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'proposal_items',
  timestamps: false,
  underscored: true,
});

export default ProposalItem;
