export default {
  server: {
    hmr: {
      overlay: false,
    },
    host: '0.0.0.0',
    port: 5000,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};