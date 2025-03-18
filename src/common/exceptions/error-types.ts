export default Object.seal({
  USERS: {
    CREATE: {
      SIGN_UP_VALIDATION_CODE_STILL_ACTIVE: 'users.create.sign_up_code_still_active',
    },
    SIGN_UP_VALIDATION_CODE: {
      CODE_INVALID_OR_EXPIRED: 'users.validate_sign_up.code.invalid_or_expired',
    },
  },

  ATTACHMENTS: {
    CREATE: {
      INVALID_CONTENT_TYPE: 'attachments.create.invalid_content_type',
      FILE_SIZE_LIMIT_EXCEEDED: 'attachments.create.file_size_limit_exceeded',
    },
  },
});
