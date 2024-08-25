import * as templates from './templates';
import { AllTypes } from './templates/enums';
import { getHtmlString } from './templates/utils';

export default function assembleTemplate(
  type: AllTypes,
  templateArgs: any,
): { subject: string; html: string } {
  let subject;
  let templateBody;

  switch (type) {
    case 'SIGN_UP_CODE':
      subject = 'Seu código de verificação - Financial Planner App';
      templateBody = templates.signUpCode(templateArgs);
      break;

    default:
      throw new Error('Invalid template ID');
  }

  const wholeTemplate = `
  <div style="display: block; width: 500px;">
      ${getHtmlString('header.html')}

      ${templateBody}

      ${getHtmlString('footer.html')}
    </div>
    `;

  return { subject, html: wholeTemplate };
}
