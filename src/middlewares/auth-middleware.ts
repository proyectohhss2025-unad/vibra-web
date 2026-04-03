import { AuthService } from '@/services/auth.service';
import { NestMiddleware } from '@nestjs/common';

export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly authService: AuthService) { }

    async use(req: any, res: any, next: Function) {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ message: 'No se encuentra token de autenticación' });
        }

        try {
            const decodedUser = await this.authService.verifyJwtToken(token);
            req.user = decodedUser; // Almacena la información del usuario en la solicitud
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token de autenticación inválido' });
        }
    }
}
