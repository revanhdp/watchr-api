import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoQueryDto } from './dto/video-query.dto';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER, UserRole.CREATOR, UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('video', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('video/')) {
          return callback(new Error('Only video files are allowed'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 500, // 500MB limit for cinema masters
      },
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateVideoDto,
    @Req() req: RequestWithUser,
  ) {
    if (!file) {
      throw new BadRequestException('Video file is required');
    }
    return this.videoService.createVideo(file, body, req.user.userId);
  }

  @Get('featured')
  async getFeatured() {
    const data = await this.videoService.getFeatured();
    return {
      message: 'Success',
      data,
    };
  }

  @Get(':id/related')
  async getRelated(@Param('id') id: string) {
    const data = await this.videoService.getRelated(id);
    return {
      message: 'Success',
      data,
    };
  }

  @Post(':id/view')
  async trackView(@Param('id') id: string) {
    const data = await this.videoService.incrementView(id);
    return {
      message: 'View counter updated',
      data,
    };
  }

  @Get(':id')
  async getVideo(@Param('id') id: string) {
    return this.videoService.findOne(id);
  }

  @Get()
  async getAllVideo(@Query() query: VideoQueryDto) {
    const data = await this.videoService.findAll(query);
    return {
      message: 'Success',
      data,
      total: data.length,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteVideo(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    await this.videoService.deleteVideo(id, req.user.userId, req.user.role);

    return {
      message: 'Video berhasil dihapus',
    };
  }
}
