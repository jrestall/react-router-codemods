import { describe, it } from 'vitest';
import jscodeshift, { type API } from 'jscodeshift';
import transform from '../src/index.js';
import assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

function buildApi(parser: string | undefined): API {
  return {
    j: parser ? jscodeshift.withParser(parser) : jscodeshift,
    jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
    stats: () => {
      console.error(
        'The stats function was called, which is not supported on purpose'
      );
    },
    report: () => {
      console.error(
        'The report function was called, which is not supported on purpose'
      );
    },
  };
}

async function readTestFile(filePath: string): Promise<string> {
  return await readFile(
    join(__dirname, '..', '__testfixtures__', filePath),
    'utf-8'
  );
}

async function testTransformation(
  inputFile: string,
  outputFile: string,
  filePath: string
) {
  const INPUT = await readTestFile(inputFile);
  const OUTPUT = await readTestFile(outputFile);

  const actualOutput = transform(
    {
      path: filePath,
      source: INPUT,
    },
    buildApi('tsx')
  );

  assert.deepEqual(actualOutput, OUTPUT);
}

describe('remix-to-react-router', () => {
  it('migrates package.json dependencies and scripts', async () => {
    await testTransformation(
      'package1.input.json',
      'package1.output.json',
      'package.json'
    );
  });

  it('migrates entry.client.tsx', async () => {
    await testTransformation(
      'entry.client.remix.tsx',
      'entry.client.rr7.tsx',
      'entry.client.tsx'
    );
  });

  it('migrates entry.server.tsx', async () => {
    await testTransformation(
      'entry.server.remix.tsx',
      'entry.server.rr7.tsx',
      'entry.server.tsx'
    );
  });

  it('migrates @remix-run/testing', async () => {
    await testTransformation(
      'testing.remix.tsx',
      'testing.rr7.tsx',
      '$username.test.tsx'
    );
  });

  it('migrates vite.config.ts', async () => {
    await testTransformation(
      'vite.config.remix.ts',
      'vite.config.rr7.ts',
      'vite.config.ts'
    );
  });

  it('migrates changed imports', async () => {
    await testTransformation(
      'imports.remix.tsx',
      'imports.rr7.tsx',
      'test.tsx'
    );
  });
});
