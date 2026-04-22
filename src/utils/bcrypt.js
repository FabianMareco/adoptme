import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
export const hashPassword  = (password)        => bcrypt.hash(password, SALT_ROUNDS);
export const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);
