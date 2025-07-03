import bcrypt from "bcryptjs";
import env from "@/env";

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, env.SALT_ROUNDS as number);
};

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};