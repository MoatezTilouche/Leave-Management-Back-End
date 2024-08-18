import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log(`Validating user: ${email}`); 
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.log('Validation failed: user not found or password incorrect'); 
      throw new UnauthorizedException();
    }
    console.log('Validation successful'); 
    return user;
  }
}
