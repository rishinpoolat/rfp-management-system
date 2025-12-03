import sequelize from '../config/database.js';
import RFP from './RFP.js';
import RFPItem from './RFPItem.js';
import Vendor from './Vendor.js';
import RFPVendor from './RFPVendor.js';
import Proposal from './Proposal.js';
import ProposalItem from './ProposalItem.js';

// Define associations
RFP.hasMany(RFPItem, {
  foreignKey: 'rfp_id',
  as: 'items',
  onDelete: 'CASCADE',
});
RFPItem.belongsTo(RFP, {
  foreignKey: 'rfp_id',
  as: 'rfp',
});

RFP.belongsToMany(Vendor, {
  through: RFPVendor,
  foreignKey: 'rfp_id',
  otherKey: 'vendor_id',
  as: 'vendors',
});
Vendor.belongsToMany(RFP, {
  through: RFPVendor,
  foreignKey: 'vendor_id',
  otherKey: 'rfp_id',
  as: 'rfps',
});

RFP.hasMany(Proposal, {
  foreignKey: 'rfp_id',
  as: 'proposals',
  onDelete: 'CASCADE',
});
Proposal.belongsTo(RFP, {
  foreignKey: 'rfp_id',
  as: 'rfp',
});

Vendor.hasMany(Proposal, {
  foreignKey: 'vendor_id',
  as: 'proposals',
  onDelete: 'CASCADE',
});
Proposal.belongsTo(Vendor, {
  foreignKey: 'vendor_id',
  as: 'vendor',
});

Proposal.hasMany(ProposalItem, {
  foreignKey: 'proposal_id',
  as: 'line_items',
  onDelete: 'CASCADE',
});
ProposalItem.belongsTo(Proposal, {
  foreignKey: 'proposal_id',
  as: 'proposal',
});

RFPItem.hasMany(ProposalItem, {
  foreignKey: 'rfp_item_id',
  as: 'proposal_items',
});
ProposalItem.belongsTo(RFPItem, {
  foreignKey: 'rfp_item_id',
  as: 'rfp_item',
});

// Sync models with database (only in development)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: false }).then(() => {
    console.log('✓ Sequelize: All models synchronized');
  });
}

export {
  sequelize,
  RFP,
  RFPItem,
  Vendor,
  RFPVendor,
  Proposal,
  ProposalItem,
};

export default {
  sequelize,
  RFP,
  RFPItem,
  Vendor,
  RFPVendor,
  Proposal,
  ProposalItem,
};
