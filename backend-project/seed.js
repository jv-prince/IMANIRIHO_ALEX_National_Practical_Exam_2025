/**
 * Seed script - Creates default admin user and departments
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb://127.0.0.1:27017/EPMS';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'hr' },
}, { timestamps: true });

const departmentSchema = new mongoose.Schema({
  departmentCode: { type: String, required: true, unique: true, uppercase: true },
  departmentName: { type: String, required: true },
  grossSalary: { type: Number, required: true },
  totalDeduction: { type: Number, default: 0 },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', departmentSchema);

const departments = [
  { departmentCode: 'CW', departmentName: 'Carwash', grossSalary: 300000, totalDeduction: 20000 },
  { departmentCode: 'ST', departmentName: 'Stock', grossSalary: 200000, totalDeduction: 5000 },
  { departmentCode: 'MC', departmentName: 'Mechanic', grossSalary: 450000, totalDeduction: 40000 },
  { departmentCode: 'ADMS', departmentName: 'Administration Staff', grossSalary: 600000, totalDeduction: 70000 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB - EPMS');

  // Create admin user
  const existingUser = await User.findOne({ username: 'admin' });
  if (!existingUser) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashed, role: 'hr' });
    console.log('Admin user created: admin / admin123');
  } else {
    console.log('Admin user already exists');
  }

  // Create departments
  for (const dept of departments) {
    const existing = await Department.findOne({ departmentCode: dept.departmentCode });
    if (!existing) {
      await Department.create(dept);
      console.log('Department created:', dept.departmentCode, '-', dept.departmentName);
    } else {
      console.log('Department exists:', dept.departmentCode);
    }
  }

  console.log('\nSeed completed! Login: admin / admin123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
