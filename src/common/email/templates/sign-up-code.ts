import { TypeToTemplateArgsMap } from '../templates/enums';
import { getHtmlString } from './utils';

export default (args: TypeToTemplateArgsMap['SIGN_UP_CODE']) => {
  const rawTemplate = getHtmlString('sign-up-code.html');

  let fullTemplate = rawTemplate;
  Object.entries(args).forEach(([key, value]) => {
    fullTemplate = fullTemplate.replace(`:${key}`, `${value}`);
  });

  return fullTemplate;
};
