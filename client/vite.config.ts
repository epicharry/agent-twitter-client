import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-routes',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/')) {
            const apiPath = req.url.replace('/api/', '');

            try {
              const handler = await import(`./api/${apiPath}.js`);

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });

              req.on('end', async () => {
                req.body = body ? JSON.parse(body) : {};
                await handler.default(req, res);
              });
            } catch (error) {
              console.error('API Error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Internal server error' }));
            }
          } else {
            next();
          }
        });
      },
    },
  ],
})
