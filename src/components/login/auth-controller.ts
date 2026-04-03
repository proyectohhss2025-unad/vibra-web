import { User } from '../../models/user.entity';
import { AuthService } from '../../services/auth.service';

export class AuthController {
    constructor(private readonly authService: AuthService) { }

    async login(loginDto: User, req: any, res: any) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const token = await this.authService.createJwtToken(user);
        res.send({ token });
    }
}