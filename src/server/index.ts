import { io, app } from 'fullstack-system';
import { config as setupDotEnv } from 'dotenv';
import bodyParser from 'body-parser';

import setupLogin from './handlers/login';

import {
  setupDatabase,
  getSimpleElement,
  getElementCount,
  recipeExists,
  getChildId,
  addSuggestion,
  getTopSuggestions,
  submitVote,
  submitDownvote,
  getFullElement,
  elementExists,
  getSankeyData
} from './database';
import { verifyGoogleToken } from './google';

setupDotEnv();

setupDatabase();

io.on('connection', function (socket) {
  setupLogin(socket);
});

app.use(bodyParser());

app.get('/api/element-count', async (req, res) => {
  res.send(await getElementCount());
});
app.get('/api/default-elements', async (req, res) => {
  res.send([
    await getSimpleElement(1),
    await getSimpleElement(2),
    await getSimpleElement(3),
    await getSimpleElement(4)
  ]);
});
app.get('/api/get-recipe/:parent1/:parent2', async (req, res) => {
  if (await recipeExists(Number(req.params.parent1), Number(req.params.parent2))) {
    res.set({ Type: 'Element' });
    res.send(
      await getSimpleElement(
        await getChildId(Number(req.params.parent1), Number(req.params.parent2))
      )
    );
    return;
  }
  res.set({ Type: 'Suggest' });
  res.send();
});
app.get('/api/get-element/:elementId', async (req, res) => {
  res.set({ Type: 'Element' });
  res.send(await getSimpleElement(Number(req.params.elementId)));
});
app.get('/api/get-full-element/:elementId', async (req, res) => {
  res.set({ Type: 'Element' });
  res.send(await getFullElement(Number(req.params.elementId)));
});
app.post('/api/suggest', async (req, res) => {
  if (req.headers.token && (await verifyGoogleToken(req.headers.token as string))) {
    addSuggestion(req.body.suggestion);
  }
  res.end();
});
app.get('/api/suggestions/:parent1/:parent2', async (req, res) => {
  res.send(await getTopSuggestions(Number(req.params.parent1), Number(req.params.parent2)));
});
app.get('/api/vote/:uuid', async (req, res) => {
  if (req.headers.token) {
    const userId = await verifyGoogleToken(req.headers.token as string);
    if (userId && req.headers.pioneer) {
      res.send(await submitVote(req.params.uuid, userId, req.headers.pioneer as string));
    }
  }
  res.end();
});
app.get('/api/downvote/:uuid', async (req, res) => {
  if (req.headers.token) {
    const userId = await verifyGoogleToken(req.headers.token as string);
    if (userId) {
      res.send(await submitDownvote(req.params.uuid, userId));
    }
  }
  res.end();
});

app.get('/api/sankey/:elementId', async (req, res) => {
  const elementId = Number(req.params.elementId);

  if (elementExists(elementId)) {
    res.send(await getSankeyData(elementId));
  }
  res.end();
});

app.get('/elemental.json', async (req, res) => {
  res.send({
    type: 'reborn',
    name: 'Elemental Reborn Official',
    googleAuth: {
      clientId: '148901687072-c2otormactiabvs9iqacd751e7f62f9b.apps.googleusercontent.com'
    }
  });
});
