const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGO_URI = "mongodb+srv://raxwotechnology_db_user:JdLoSa5zV20xaH96@cluster0.pgdcy8f.mongodb.net/hotel_pms?retryWrites=true&w=majority";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, default: "" },
  role: { type: String, default: "customer" },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected successfully!");

  const hashedPasswordAdmin = await bcrypt.hash("admin123", 10);
  const hashedPasswordCustomer = await bcrypt.hash("password123", 10);

  // Upsert Admin
  const admin = await User.findOneAndUpdate(
    { email: "admin@hotel.com" },
    {
      name: "Hotel Administrator",
      email: "admin@hotel.com",
      password: hashedPasswordAdmin,
      phone: "0771234567",
      role: "admin"
    },
    { upsert: true, new: true }
  );
  console.log("ADMIN ACCOUNT READY:", admin.email, "role:", admin.role);

  // Upsert Customer
  const customer = await User.findOneAndUpdate(
    { email: "customer@hotel.com" },
    {
      name: "Demo Customer",
      email: "customer@hotel.com",
      password: hashedPasswordCustomer,
      phone: "0777654321",
      role: "customer"
    },
    { upsert: true, new: true }
  );
  console.log("CUSTOMER ACCOUNT READY:", customer.email, "role:", customer.role);

  console.log("ALL ACCOUNTS HAVE BEEN SUCCESSFULLY CREATED IN DATABASE!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("SEED FAILED:", err);
  process.exit(1);
});
