import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';
import config from 'config';

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

  static generateToken(payload: object): string {
    return Jwt.sign(payload, config.get('App.auth.key'), {
      expiresIn: config.get('App.auth.tokenExpiresIn'),
    });
  }
}
