import { Controller, Get, Res } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';

@Controller()
export class StaticController {
  @Public()
  @Get('/')
  serveRoot(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'index.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('index.html')
  serveIndex(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'index.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('admin-test.html')
  serveAdminTest(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'admin-test.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('api-test.html')
  serveApiTest(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'api-test.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('tablet-simulator.html')
  serveTabletSimulator(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'tablet-simulator.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('test-app.html')
  serveTestApp(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'test-app.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('TestAuth.html')
  serveTestAuth(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'TestAuth.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('unlock-test.html')
  serveUnlockTest(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'unlock-test.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('websocket-test.html')
  serveWebsocketTest(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'websocket-test.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('branch-test.html')
  serveBranchTest(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'branch-test.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }

  @Public()
  @Get('frontend-debug.html')
  serveFrontendDebug(@Res() res: Response) {
    const filePath = join(__dirname, '..', '..', '..', 'public', 'frontend-debug.html');
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    res.status(404).send('File not found');
  }
}
