import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoQueryDto } from './dto/video-query.dto';

@Injectable()
export class VideoService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    @InjectQueue('video-processing') private videoQueue: Queue,
  ) { }

  private parseArrayField(field?: string | string[]): string[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    return field.split(',').map((item) => item.trim()).filter(Boolean);
  }

  async createVideo(file: Express.Multer.File, body: CreateVideoDto, userId: string) {
    const {
      title,
      description,
      tags,
      originalTitle,
      director,
      studio,
      year,
      duration,
      aspectRatio,
      audioFormat,
      colorGrade,
      colorPalette,
      curatorQuote,
      awards,
      mood,
      moodLabel,
      backdrop,
      poster,
      isFeatured,
      chapters,
    } = body;

    // Parse chapters if provided
    let parsedChapters: any = [];
    if (chapters) {
      if (typeof chapters === 'string') {
        try {
          parsedChapters = JSON.parse(chapters);
        } catch {
          parsedChapters = [];
        }
      } else if (Array.isArray(chapters)) {
        parsedChapters = chapters;
      }
    }

    // Simple slug generator
    const slug = title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    // Upload to MinIO
    const fileKey = await this.storageService.uploadFile(file);
    const videoUrl = await this.storageService.getFileUrl(fileKey);

    const video = await this.prisma.video.create({
      data: {
        title,
        slug: `${slug}-${Date.now()}`,
        originalTitle,
        director: director || 'Unknown Director',
        studio: studio || 'Independent',
        year: year || new Date().getFullYear().toString(),
        duration: duration || '00:00',
        aspectRatio: aspectRatio || '16:9',
        audioFormat: audioFormat || 'Stereo',
        colorGrade: colorGrade || 'Standard Rec.709',
        colorPalette: this.parseArrayField(colorPalette),
        curatorQuote,
        awards: this.parseArrayField(awards),
        mood: mood || 'all',
        moodLabel: moodLabel || 'Koleksi Sinema',
        backdrop: backdrop || '',
        poster,
        isFeatured: Boolean(isFeatured),
        chapters: parsedChapters,
        description,
        videoUrl,
        thumbnailUrl: backdrop || null,
        userId,
        tags: this.parseArrayField(tags),
      },
    });

    // Add to processing queue
    await this.videoQueue.add(
      'process-video',
      {
        videoId: video.id,
        videoUrl: video.videoUrl,
      },
      {
        attempts: 2,
      },
    );

    return video;
  }

  async findAll(query?: VideoQueryDto) {
    const where: any = {};

    if (query?.mood && query.mood !== 'all') {
      where.mood = query.mood;
    }

    if (query?.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { director: { contains: query.search, mode: 'insensitive' } },
        { studio: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return await this.prisma.video.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  }

  async getFeatured() {
    const featured = await this.prisma.video.findFirst({
      where: { isFeatured: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (featured) return featured;

    return await this.prisma.video.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findOne(idOrSlug: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    const video = await this.prisma.video.findFirst({
      where: isUuid
        ? { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
        : { slug: idOrSlug },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 15,
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!video) {
      throw new NotFoundException(`Video '${idOrSlug}' tidak ditemukan`);
    }

    return video;
  }

  async getRelated(idOrSlug: string) {
    const currentVideo = await this.findOne(idOrSlug).catch(() => null);

    return await this.prisma.video.findMany({
      where: currentVideo
        ? {
            id: { not: currentVideo.id },
          }
        : undefined,
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        director: true,
        duration: true,
        aspectRatio: true,
        colorPalette: true,
        backdrop: true,
        poster: true,
        mood: true,
      },
    });
  }

  async incrementView(idOrSlug: string) {
    const video = await this.findOne(idOrSlug);

    const updated = await this.prisma.video.update({
      where: { id: video.id },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        id: true,
        views: true,
      },
    });

    return updated;
  }

  async deleteVideo(id: string, userId: string, userRole: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException(`Video dengan ID ${id} tidak ditemukan`);
    }

    const isOwner = video.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        `Anda tidak memiliki izin untuk menghapus video ini`,
      );
    }

    // 1. Hapus semua file terkait di MinIO
    await this.storageService.deleteFileByUrl(video.videoUrl);
    await this.storageService.deleteFolder(`processed/${id}`);

    // 2. Hapus data dari database
    return await this.prisma.video.delete({
      where: { id },
    });
  }
}
