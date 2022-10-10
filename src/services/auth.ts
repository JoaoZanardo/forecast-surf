import bcrypt from 'bcrypt';

export default class AuthService {
  static async hashPassword(password: string, salt = 10): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  static async comparePasswords(
    passowrd: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(passowrd, hashedPassword);
  }
}
