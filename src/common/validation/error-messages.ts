import errorCodes from './error-codes';

export default Object.seal({
  [errorCodes.INVALID_TYPE]:
    'Invalid parameter value. Make sure that a value is being sent and that it has the correct type',
  [errorCodes.INVALID_LITERAL]: 'Invalid literal value',
  [errorCodes.CUSTOM]: 'Custom',
  [errorCodes.INVALID_UNION]: 'Invalid union value',
  [errorCodes.INVALID_UNION_DISCRIMINATOR]: 'Invalid Union Discriminator',
  [errorCodes.INVALID_ENUM_VALUE]: 'Non-valid enum option',
  [errorCodes.UNRECOGNIZED_KEYS]: 'Non-allowed keys sent',
  [errorCodes.INVALID_ARGUMENTS]: 'Invalid arguments',
  [errorCodes.INVALID_RETURN_TYPE]: 'Invalid return type',
  [errorCodes.INVALID_DATE]: 'A date value appears to be incorrect',
  [errorCodes.INVALID_STRING]: 'A string value appears to be incorrect',
  [errorCodes.TOO_SMALL]: 'One or more values appear to be too small',
  [errorCodes.TOO_BIG]: 'One or more values appear to be too big',
  [errorCodes.INVALID_INTERSECTION_TYPES]: 'Invalid intersection types',
  [errorCodes.NOT_MULTIPLE_OF]: 'Not multiple of',
  [errorCodes.NOT_FINITE]: 'Not finite',
});
