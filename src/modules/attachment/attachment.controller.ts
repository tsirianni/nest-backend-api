import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';

import { DecryptUUIDPipe, ValidationInterceptor } from '../../common/validation';
import { AttachmentInterceptor } from '../../common/attachment';
import { AttachmentDTOs, default as schemas } from './dto';
import { AttachmentService } from './attachment.service';
import { JWTAuthGuard } from '../auth/guards';
import { AuthenticatedRequest } from '../auth/dto';
import * as attachmentDocs from './docs';
import { RouteDoc } from '../../common/docs';

@Controller('attachments')
export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Post('/')
  @UseGuards(JWTAuthGuard)
  @RouteDoc(attachmentDocs.createAttachment)
  @UseInterceptors(new AttachmentInterceptor({ maxFileSizeInBytes: 2 * 1024 * 1024 }), new ValidationInterceptor(schemas.create))
  @HttpCode(HttpStatus.CREATED)
  create(@Req() req: AuthenticatedRequest) {
    const requestBody = req.body as unknown as AttachmentDTOs['create'];

    return this.attachmentService.create(requestBody.files, req.user);
  }

  @Get('/:id')
  @UseGuards(JWTAuthGuard)
  @RouteDoc(attachmentDocs.downloadAttachment)
  @UseInterceptors(new ValidationInterceptor(schemas.download))
  @HttpCode(HttpStatus.OK)
  download(@Req() req: AuthenticatedRequest, @Param(DecryptUUIDPipe) params: AttachmentDTOs['download']) {
    return this.attachmentService.download(params.id, req.user);
  }

  @Delete('/:id')
  @UseGuards(JWTAuthGuard)
  @RouteDoc(attachmentDocs.deleteAttachment)
  @UseInterceptors(new ValidationInterceptor(schemas.delete))
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Req() req: AuthenticatedRequest, @Param(DecryptUUIDPipe) params: AttachmentDTOs['delete']) {
    return this.attachmentService.delete(params.id, req.user);
  }
}
