import { User } from '../models/user.entity';
import { Bcrypt } from './bcrypt.service';

export class UsersService {
    constructor(
        private readonly userRepository: User,
        private readonly bcrypt: Bcrypt,
    ) { }

    async findByID(id: string): Promise<User | null> {
        return null;
    }

    async findByEmail(email: string): Promise<User | null> {
        return null;
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await this.bcrypt.compare(password, hashedPassword);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.findByEmail(email);
        if (!user) {
            return null;
        }

        const isPasswordValid = await this.bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }
}