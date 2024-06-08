import { ZodIssueCode } from 'zod';

export default Object.seal({
  INVALID_TYPE: ZodIssueCode.invalid_type,
  INVALID_LITERAL: ZodIssueCode.invalid_literal,
  CUSTOM: ZodIssueCode.custom,
  INVALID_UNION: ZodIssueCode.invalid_union,
  INVALID_UNION_DISCRIMINATOR: ZodIssueCode.invalid_union_discriminator,
  INVALID_ENUM_VALUE: ZodIssueCode.invalid_enum_value,
  UNRECOGNIZED_KEYS: ZodIssueCode.unrecognized_keys,
  INVALID_ARGUMENTS: ZodIssueCode.invalid_arguments,
  INVALID_RETURN_TYPE: ZodIssueCode.invalid_return_type,
  INVALID_DATE: ZodIssueCode.invalid_date,
  INVALID_STRING: ZodIssueCode.invalid_string,
  TOO_SMALL: ZodIssueCode.too_small,
  TOO_BIG: ZodIssueCode.too_big,
  INVALID_INTERSECTION_TYPES: ZodIssueCode.invalid_intersection_types,
  NOT_MULTIPLE_OF: ZodIssueCode.not_multiple_of,
  NOT_FINITE: ZodIssueCode.not_finite,
});
