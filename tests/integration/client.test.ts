import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { createApp } from '../../src/app';
import type { Services } from '../../src/container';

// Client hosting never touches the service layer.
const services = { movieService: {} } as Services;
let clientDir: string;

beforeAll(() => {
  clientDir = fs.mkdtempSync(path.join(os.tmpdir(), 'client-'));
  fs.writeFileSync(path.join(clientDir, 'index.html'), '<!doctype html><div id="root"></div>');
  fs.writeFileSync(path.join(clientDir, 'app.js'), 'console.log(1)');
});

afterAll(() => fs.rmSync(clientDir, { recursive: true, force: true }));

describe('client hosting', () => {
  const app = () => createApp(services, { clientDir });

  test('serves static assets', async () => {
    await request(app()).get('/app.js').expect(200).expect('Content-Type', /javascript/);
  });

  test('falls back to index.html for client routes', async () => {
    const res = await request(app()).get('/movies/tt123').set('Accept', 'text/html').expect(200);
    expect(res.text).toContain('id="root"');
  });

  test('unknown API routes still return JSON 404', async () => {
    const res = await request(app()).get('/api/v1/nope').set('Accept', 'text/html').expect(404);
    expect(res.body.error.status).toBe(404);
  });

  test('is skipped when the client has not been built', async () => {
    await request(createApp(services, { clientDir: '/does/not/exist' })).get('/').expect(404);
  });
});
