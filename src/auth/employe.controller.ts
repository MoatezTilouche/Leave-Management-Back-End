import { Controller, Post, UseInterceptors, Param, UploadedFile, Body, Get, Put, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { v2 as cloudinary } from 'cloudinary';
import { EmployeService } from './employe.service';
import { Employe } from './schemas/employe_schema';
import { Conge } from 'src/conge/schemas/conge_schema';
import { ChangePasswordDto } from './dto/change_password.dto';
import { UpdateEmployeDto } from './dto/update-employe.dto';

@Controller('employe')
export class EmployeController {
  constructor(private employeService: EmployeService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }



  @Get()
  async findAll(): Promise<Employe[]> {
    return this.employeService.findAll();
  }

  @Put(':id')
  async updateEmploye(
      @Param('id') id: string,
      @Body() employe: UpdateEmployeDto,
  ): Promise<Employe> {
      return this.employeService.updateById(id, employe);
  }

  @Get('count')
async getEmployeCount(): Promise<{ count: number }> {
  const count = await this.employeService.getEmployeCount();
  return { count };
}

  @Get(':employeId/conges')
  async getEmployeConges(@Param('employeId') employeId: string): Promise<Conge[]> {
      return this.employeService.findEmployeConges(employeId);
  }

  @Get(':id')
  async getEmployeById(@Param('id') employeId: string): Promise<Employe> {
    return this.employeService.findEmployeById(employeId);
  }

  @Put(':id/change-password')
  async changePassword(
      @Param('id') id: string,
      @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
      return this.employeService.changePassword(id, changePasswordDto);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Employe> {
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

      
      const updatedEmploye = await this.employeService.updatePhoto(id, photoUrl);

      return updatedEmploye;
    } catch (error) {
      console.error('Error uploading photo:', error, error);
      throw new Error(`Failed to upload photo: ${error}`);
    }
  }
  
  @Delete('delete/:id')
  async deleteConge(
    @Param('id') id: string,
  ): Promise<Employe> {
    return this.employeService.deleteById(id);
  }
  
 
}
