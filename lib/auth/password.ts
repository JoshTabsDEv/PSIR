import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

// Compared against when the username does not exist, so login timing does not
// reveal which usernames are valid. Computed once per process.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  return bcrypt.compare(password, hash || DUMMY_HASH);
}
