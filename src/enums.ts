export default {
  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
  },

  PROFILE_TYPE: {
    TECHNICAL: 'Technical',
    NON_TECHNICAL: 'Non-technical',
  },

  CONFIG: {
    NODE_ENV: 'nodeEnv',
    API_DOMAIN: 'apiDomain',
    API_PORT: 'apiPort',

    SMTP: {
      HOST: 'smtp.host',
      PORT: 'smtp.port',
      SECURE: 'smtp.secure',
      FROM: 'smtp.from',
      AUTH: {
        USER: 'smtp.auth.user',
        PASSWORD: 'smtp.auth.password',
      },
    },
  },
};
