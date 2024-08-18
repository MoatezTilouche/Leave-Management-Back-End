import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeSchema } from './schemas/employe_schema';
import { AdministrateurSchema } from './schemas/administrateur_schema';
import { UserSchema } from './schemas/user_schema';
import { UserService } from './user.service';
import { SharedModule } from 'src/shared/shared.module';
import { MailService } from './mail/mail.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string | number>('JWT_EXPIRE') },
      }),
    }),
    
    SharedModule,
    NotificationModule, 

    MongooseModule.forFeature([
      { name: 'Employe', schema: EmployeSchema },
      { name: 'Administrateur', schema: AdministrateurSchema },
      { name: 'User', schema: UserSchema },
    ]),
    
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, UserService,MailService],
  exports: [AuthService],
})
export class AuthModule {}
