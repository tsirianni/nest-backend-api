import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { FILE_MIMETYPE } from '../../../enums';

export const ACCEPT_CONTENT_TYPE_KEY = 'acceptContentType';
export default (...contentTypes: FILE_MIMETYPE[]): CustomDecorator => SetMetadata(ACCEPT_CONTENT_TYPE_KEY, contentTypes);
