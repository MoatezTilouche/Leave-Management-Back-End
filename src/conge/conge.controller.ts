
import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CongeService } from './conge.service';
import { Conge } from './schemas/conge_schema';
import { CreateCongeDto } from './dto/create-conges-dto';
import { UpdateCongeDto } from './dto/update-conge-dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { v2 as cloudinary } from 'cloudinary';
import { FileInterceptor } from '@nestjs/platform-express';

import * as streamifier from 'streamifier';


@Controller('conges')
export class CongeController {
  constructor(private congeService: CongeService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  @Get()
  async getAllConges(): Promise<Conge[]> {
    return this.congeService.findAll();
  }

 @Get("requests")
  async getCongesWithNames(): Promise<{ conge: Conge, employeName: string }[]> {
    return this.congeService.findAllWithNames();
  }
  @Get("accepted")
  async getAcceptedCongesWithNames(): Promise<{ conge: Conge, employeName: string }[]> {
    return this.congeService.findAcceptedConges();
  }

  @Get("pending")
  async getPendingCongesWithNames(): Promise<{ conge: Conge, employeName: string }[]> {
    return this.congeService.findPendingConges();
  }

  @Post('new')
  async createConge(
    @Body('email') email: string,
    @Body() conge: CreateCongeDto,
  ): Promise<Conge> {
    console.log('Received createConge request:', { email, conge });
    return this.congeService.createDemandeConge(email, conge);
  }
  @Get(':id')
  async getConge(
    @Param('id') id: string,
  ): Promise<Conge> {
    return this.congeService.findById(id);
  }

  @Put(':id')
  async updateConge(
    @Param('id') id: string,
    @Body() conge: UpdateCongeDto,
  ): Promise<Conge> {
    return this.congeService.updateById(id, conge);
  }

  @Delete(':id')
  async deleteConge(
    @Param('id') id: string,
  ): Promise<Conge> {
    return this.congeService.deleteById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accept')
  async acceptConge(@Param('id') id: string) {
    return await this.congeService.acceptConge(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/reject')
  async rejectConge(@Param('id') id: string) {
    return await this.congeService.rejectConge(id);
  }


  @Post(':id/attestation')
  @UseInterceptors(FileInterceptor('attestation'))
  async uploadAttestation(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Conge> {
    console.log("Uploaded file info:", file);
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    try {
      // Convert buffer to stream
      const stream = streamifier.createReadStream(file.buffer);

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'auto' }, // Auto-detect file type
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(file.buffer); // End the stream with the file buffer
      });

      const attUrl = result.secure_url;

      if (!attUrl) {
        throw new BadRequestException("Failed to get attestation's URL from Cloudinary");
      }

      const updatedConge = await this.congeService.updateAttestation(id, attUrl);
      return updatedConge;
    } catch (error) {
      console.error('Error uploading attestation:', error);
      throw new BadRequestException(`Failed to upload attestation: ${error}`);
    }
  }

  //STATS
  @Get('statistics/leave-percentages')
  async getLeavePercentages(): Promise<{ type: string, percentage: number }[]> {
    return this.congeService.getLeaveTypePercentages();
  }

  @Get('count/accepted/:employeId')
  async countAcceptedCongesForEmploye(@Param('employeId') employeId: string): Promise<number> {
    return this.congeService.countAcceptedCongesForEmploye(employeId);
  }

  @Get('count/pending/:employeId')
  async countPendingCongesForEmploye(@Param('employeId') employeId: string): Promise<number> {
    return this.congeService.countPendingCongesForEmploye(employeId);
  }

  @Get('count/rejected/:employeId')
  async countRejectedCongesForEmploye(@Param('employeId') employeId: string): Promise<number> {
    return this.congeService.countRejectedCongesForEmploye(employeId);
  }

  @Get('total-days-taken-this-year/:employeId')
  async getTotalDaysTakenThisYear(@Param('employeId') employeId: string): Promise<number> {
   return this.congeService.calculateTotalDaysTakenThisYear(employeId);
  }
}
