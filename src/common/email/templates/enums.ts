type SignUpCode = {
  type: 'SIGN_UP_CODE';
  templateArgs: {
    name: string;
    verificationCode: number;
  };
};

type SignUpCodeTwo = {
  type: 'SIGN_UP_CODE_TWO';
  templateArgs: {
    name2: string;
    verificationCode2: number;
  };
};

type EmailTypes = SignUpCode | SignUpCodeTwo;

export type AllEmailTypes = EmailTypes['type'];

export type TypeToTemplateArgsMap = {
  [E in EmailTypes as E['type']]: E['templateArgs'];
};
