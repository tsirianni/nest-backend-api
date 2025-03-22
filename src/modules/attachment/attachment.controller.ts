import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ValidationInterceptor } from '../../common/validation/payload-validation.interceptor';
import { AttachmentInterceptor } from '../../common/attachment';
import { AttachmentDTOs, default as schemas } from './dto';
import { AttachmentService } from './attachment.service';
import { JWTAuthGuard } from '../auth/guards';
import { AuthenticatedRequest } from '../auth/dto';

@Controller('attachments')
export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Post('/')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(new AttachmentInterceptor({ maxFileSizeInBytes: 2 * 1024 * 1024 }), new ValidationInterceptor(schemas.create))
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: AuthenticatedRequest) {
    const requestBody = req.body as unknown as AttachmentDTOs['create'];

    return this.attachmentService.create(requestBody.files, req.user);
  }

  @Get('/:id')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(new ValidationInterceptor(schemas.download))
  @HttpCode(HttpStatus.OK)
  download(@Req() req: AuthenticatedRequest, @Param() params: AttachmentDTOs['download']) {
    return this.attachmentService.download(params.id, req.user);
  }

  @Delete('/:id')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(new ValidationInterceptor(schemas.delete))
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Req() req: AuthenticatedRequest, @Param() params: AttachmentDTOs['delete']) {
    return this.attachmentService.delete(params.id, req.user);
  }
}
