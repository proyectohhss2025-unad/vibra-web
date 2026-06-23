import * as bcrypt from 'bcryptjs';

export class Bcrypt {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10); // Cost factor de 10
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}