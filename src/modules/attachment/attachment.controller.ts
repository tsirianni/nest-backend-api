import { Controller, HttpCode, HttpStatus, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ValidationInterceptor } from '../../common/validation/payload-validation.interceptor';
import { AttachmentInterceptor } from '../../common/attachment';
import { AttachmentDTOs, default as schemas } from './dto';
import { AttachmentService } from './attachment.service';
import { JWTAuthGuard } from '../auth/guards/jwt.guard';
import { AuthenticatedRequest } from '../auth/dto/authenticated-request.dto';

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
}
