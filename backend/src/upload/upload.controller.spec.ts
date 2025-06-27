import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;

  const mockUploadService = {
    getFileUrl: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image and return file data', async () => {
      const mockFile = {
        filename: 'test-image-123456789.jpg',
      } as Express.Multer.File;

      const expectedUrl = 'http://localhost:3000/uploads/test-image-123456789.jpg';
      mockUploadService.getFileUrl.mockReturnValue(expectedUrl);

      const expectedResponse = {
        filename: mockFile.filename,
        url: expectedUrl,
      };

      const result = await controller.uploadImage(mockFile);

      expect(result).toEqual(expectedResponse);
      expect(mockUploadService.getFileUrl).toHaveBeenCalledWith(mockFile.filename);
    });
  });
}); 