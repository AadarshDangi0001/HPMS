const Counter = require('../models/Counter');

const PREFIXES = {
  patient: 'PAT',
  doctor: 'DOC',
  appointment: 'APT',
  bill: 'BIL',
};

async function generateId(entityName) {
  const prefix = PREFIXES[entityName];
  const counter = await Counter.findOneAndUpdate(
    { name: entityName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(counter.seq).padStart(4, '0');
  return `${prefix}-${padded}`;
}

module.exports = generateId;
