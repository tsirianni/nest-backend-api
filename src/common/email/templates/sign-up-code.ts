import { TypeToTemplateArgsMap } from './enums';
import { getHtmlString } from './utils';

export default (args: TypeToTemplateArgsMap['SIGN_UP_CODE']) => {
  let fullTemplate = getHtmlString('sign-up-code.html');
  Object.entries(args).forEach(([key, value]) => {
    fullTemplate = fullTemplate.replace(`:${key}`, String(value));
  });

  return fullTemplate;
};
