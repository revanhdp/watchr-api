import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

describe('VideoController', () => {
  let controller: VideoController;

  const mockVideoService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: '1', title: 'Test Film' }),
    getFeatured: jest.fn().mockResolvedValue({ id: '1', title: 'Featured Film' }),
    getRelated: jest.fn().mockResolvedValue([]),
    incrementView: jest.fn().mockResolvedValue({ id: '1', views: 1 }),
    createVideo: jest.fn(),
    deleteVideo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [
        {
          provide: VideoService,
          useValue: mockVideoService,
        },
      ],
    }).compile();

    controller = module.get<VideoController>(VideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
