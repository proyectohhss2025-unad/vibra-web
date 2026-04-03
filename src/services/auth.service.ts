import { JwtService } from '@nestjs/jwt';
import { UsersService } from './user.service';
import { User } from '../models/user.entity';

export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }

        const isPasswordValid = await this.usersService.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    async createJwtToken(user: User): Promise<string> {
        const payload = { userId: user._id, email: user.email };
        return this.jwtService.sign(payload);
    }

    async verifyJwtToken(token: string): Promise<User | null> {
        const payload = this.jwtService.decode(token);
        if (!payload) {
            return null;
        }

        /*const user = await this.usersService.findByID(payload.userId);
        if (!user) {
            return null;
        }*/

        return payload;
    }
}
