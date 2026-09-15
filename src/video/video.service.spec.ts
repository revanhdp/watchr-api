import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { getQueueToken } from '@nestjs/bull';

describe('VideoService', () => {
  let service: VideoService;

  const mockPrismaService = {
    video: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFileByUrl: jest.fn(),
    deleteFolder: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
        {
          provide: getQueueToken('video-processing'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
