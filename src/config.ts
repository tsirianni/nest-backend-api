export default () => ({
  nodeEnv: process.env.NODE_ENV,
  apiDomain: process.env.API_DOMAIN,
  apiPort: process.env.API_PORT,

  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    from: process.env.SMTP_FROM,
    auth: {
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },
});
