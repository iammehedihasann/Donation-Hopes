import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Wallet } from "../models/Wallet";
import { logger } from "../utils/logger";

export async function seedAdminUser(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const phone = process.env.SEED_ADMIN_PHONE;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "অ্যাডমিন";

  if (!email || !phone || !password) {
    logger.info("seed_admin_skipped");
    return;
  }

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) return;

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    email,
    password: hash,
    role: "ADMIN",
  });
  await Wallet.create({ userId: user._id, balance: 0 });
  logger.info("seed_admin_created", { email });
}
