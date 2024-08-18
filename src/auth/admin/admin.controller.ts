import { Controller, Post, UseInterceptors, Param, UploadedFile, Body, Get, Put, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { v2 as cloudinary } from 'cloudinary';
import { Administrateur } from '../schemas/administrateur_schema';
import { UpdateAdminDto } from '../dto/update_admin.dto';
import { ChangePasswordDto } from '../dto/change_password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });
        }

        @Get()
        async findAll(): Promise<Administrateur[]> {
          return this.adminService.findAll();
        }

        @Put(':id')
        async updateAdmin(
            @Param('id') id: string,
            @Body() admin: UpdateAdminDto,
        ): Promise<Administrateur> {
            return this.adminService.updateById(id,admin);
        }

        @Get(':id')
        async getAdminById(@Param('id') adminId: string): Promise<Administrateur> {
          return this.adminService.findAdminById(adminId);
        }
        
        @Put(':id/change-password')
        async changePassword(
            @Param('id') id: string,
            @Body() changePasswordDto: ChangePasswordDto,
        ): Promise<void> {
            return this.adminService.changePassword(id, changePasswordDto);
        }

        @Post(':id/photo')
        @UseInterceptors(FileInterceptor('file'))
        async uploadPhoto(
          @Param('id') id: string,
          @UploadedFile() file: Express.Multer.File,
        ): Promise<Administrateur> {
          console.log("Uploaded file:", file); 
      
          try {
            if (!file) {
              throw new Error("No file uploaded");
            }
      
         
            const result = await cloudinary.uploader.upload(file.path);
      
           
            const photoUrl = result.secure_url;
      
            if (!photoUrl) {
              throw new Error("Failed to get photo URL from Cloudinary");
            }
      
            
            const updatedAdmin = await this.adminService.updatePhoto(id, photoUrl);
      
            return updatedAdmin;
          } catch (error) {
            console.error('Error uploading photo:', error, error);
            throw new Error(`Failed to upload photo: ${error}`);
          }
        }
        
        @Delete('delete/:id')
        async deleteConge(
          @Param('id') id: string,
        ): Promise<Administrateur> {
          return this.adminService.deleteById(id);
        }
      

        // @Get('count')
        // async getAdminCount(): Promise<{ count: number }> {
        //   const count = await this.adminService.getAdminCount();
        //   return { count };
        // }

        @Get(':id/employee-count')
        async countEmployeesInSameDepartment(@Param('id') id: string): Promise<{ count: number }> {
            const count = await this.adminService.countEmployeesInSameDepartment(id);
            return { count };
        }



}
