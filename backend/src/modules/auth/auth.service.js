import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "./auth.repo";

const JWT_SECRET = process.env.JWT_SECRET;

export async function register({ email, password, name }) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(email, passwordHash, name);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1d",
  });

  return { user, token };
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new Error("INVALID_CREDENTIALS");
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "1d",
  });
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}
