import bcrypt from "bcrypt";
import User from "../models/user.model";
import { env } from "../config/env";

const DEFAULT_ADMIN = {
  name: "Super Admin",
  email: "adminalidaad@gmail.com",
  password: "ADMIN@#&alidaad",
  role: "admin",
  verified: true,
};

export async function seedAdmin(): Promise<void> {
  try {
    const existing = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existing) {
      console.log("✅ Admin already exists, skipping seed.");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

    await User.create({
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      role: DEFAULT_ADMIN.role,
      verified: DEFAULT_ADMIN.verified,
    });

    console.log(`✅ Default admin created → ${DEFAULT_ADMIN.email}`);
  } catch (err) {
    console.error("❌ Admin seed failed:", err);
  }
}