import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

interface GroupData {
  groupId: string;
  teamSize: 4 | 5;
  quadrats: Record<number, {
    quadratId: number;
    studentName: string;
    speciesCounts: Record<string, number>;
    speciesCovers: Record<string, number>;
    updatedAt: number;
  }>;
}

const groups: Record<string, GroupData> = {};

const DATA_FILE = path.resolve(__dirname, '.quadrat_groups_store.json');

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      Object.assign(groups, data);
    }
  } catch (e) {
    console.error('Failed to load group store:', e);
  }
}

function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(groups, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save group store:', e);
  }
}

loadStore();

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Get group data
app.get('/api/groups/:groupId', (req, res) => {
  const { groupId } = req.params;
  const group = groups[groupId] || {
    groupId,
    teamSize: 5,
    quadrats: {},
  };
  res.json({ success: true, group });
});

// Initialize or update group configuration
app.post('/api/groups/:groupId/init', (req, res) => {
  const { groupId } = req.params;
  const { teamSize } = req.body;
  if (!groups[groupId]) {
    groups[groupId] = {
      groupId,
      teamSize: teamSize === 4 ? 4 : 5,
      quadrats: {},
    };
  } else if (teamSize === 4 || teamSize === 5) {
    groups[groupId].teamSize = teamSize;
  }
  saveStore();
  res.json({ success: true, group: groups[groupId] });
});

// Save or update an inspection for a quadrat within a specific group
app.post('/api/groups/:groupId/quadrat', (req, res) => {
  const { groupId } = req.params;
  const { quadratId, studentName, speciesCounts, speciesCovers } = req.body;
  const qId = Number(quadratId);
  if (!qId) {
    res.status(400).json({ error: 'quadratId is required' });
    return;
  }

  if (!groups[groupId]) {
    groups[groupId] = {
      groupId,
      teamSize: 5,
      quadrats: {},
    };
  }

  groups[groupId].quadrats[qId] = {
    quadratId: qId,
    studentName: studentName || `모둠원 #${qId}`,
    speciesCounts: speciesCounts || {},
    speciesCovers: speciesCovers || {},
    updatedAt: Date.now(),
  };

  saveStore();
  res.json({ success: true, group: groups[groupId] });
});

// Reset group survey data
app.post('/api/groups/:groupId/reset', (req, res) => {
  const { groupId } = req.params;
  if (groups[groupId]) {
    groups[groupId].quadrats = {};
    saveStore();
  }
  res.json({ success: true });
});

async function setupServer() {
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Full-stack Quadrat server running on port ${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
