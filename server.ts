import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleEvaluate } from './server/evaluate.ts';

dotenv.config();

// Chuẩn ES module: Xác định thư mục gốc an toàn, tránh xung đột biến toàn cục __dirname
const rootDir = fileURLToPath(new URL('.', import.meta.url));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Endpoint kiểm tra sức khỏe hệ thống
  app.get('/api/health', (_req: Request, res: Response) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
    res.json({ ok: true, hasKey });
  });

  // Endpoint đánh giá trang phục (G2.1)
  app.post('/api/evaluate', handleEvaluate);

  if (!isProd) {
    // Chế độ phát triển: tích hợp Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Chế độ production: phục vụ thư mục build dist/
    // Express 4: route wildcard sử dụng '*'
    const distPath = path.resolve(rootDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
