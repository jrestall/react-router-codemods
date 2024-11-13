// @ts-nocheck

// Taken from epic-stack (c) Kent C. Dodds
// https://github.com/epicweb-dev/epic-stack/blob/6c7eb1d529a15e0d32c49b310e8b0a7711aa01f9/app/routes/users%2B/%24username.test.tsx

/**
 * @vitest-environment jsdom
 */
import { faker } from '@faker-js/faker';
import { createRoutesStub } from 'react-router';
import { render, screen } from '@testing-library/react';
import setCookieParser from 'set-cookie-parser';
import { test } from 'vitest';
import { loader as rootLoader } from '#app/root.tsx';
import {
  getSessionExpirationDate,
  sessionKey,
} from '#app/utils/auth.server.ts';
import { prisma } from '#app/utils/db.server.ts';
import { authSessionStorage } from '#app/utils/session.server.ts';
import { createUser, getUserImages } from '#tests/db-utils.ts';
import { default as UsernameRoute, loader } from './$username.tsx';
import { vi } from 'vitest';
import type * as remix from 'react-router';

test('The user profile when not logged in as self', async () => {
  vi.mock('react-router', async () => {
    const remixActual = await import('react-router');
    return remixActual;
  });
  vi.mock('@react-router/node', async () => {
    const remixActual = await import('@react-router/node');
    return remixActual;
  });
  const userImages = await getUserImages();
  const userImage =
    userImages[faker.number.int({ min: 0, max: userImages.length - 1 })];
  const user = await prisma.user.create({
    select: { id: true, username: true, name: true },
    data: { ...createUser(), image: { create: userImage } },
  });
  const App = createRoutesStub([
    {
      path: '/users/:username',
      Component: UsernameRoute,
      loader,
    },
  ]);

  const routeUrl = `/users/${user.username}`;
  render(<App initialEntries={[routeUrl]} />);

  await screen.findByRole('heading', { level: 1, name: user.name! });
  await screen.findByRole('img', { name: user.name! });
  await screen.findByRole('link', { name: `${user.name}'s notes` });
});

test('The user profile when logged in as self', async () => {
  const userImages = await getUserImages();
  const userImage =
    userImages[faker.number.int({ min: 0, max: userImages.length - 1 })];
  const user = await prisma.user.create({
    select: { id: true, username: true, name: true },
    data: { ...createUser(), image: { create: userImage } },
  });
  const session = await prisma.session.create({
    select: { id: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
  });

  const authSession = await authSessionStorage.getSession();
  authSession.set(sessionKey, session.id);
  const setCookieHeader = await authSessionStorage.commitSession(authSession);
  const parsedCookie = setCookieParser.parseString(setCookieHeader);
  const cookieHeader = new URLSearchParams({
    [parsedCookie.name]: parsedCookie.value,
  }).toString();

  const App = createRoutesStub([
    {
      id: 'root',
      path: '/',
      loader: async (args) => {
        // add the cookie header to the request
        args.request.headers.set('cookie', cookieHeader);
        return rootLoader(args);
      },
      children: [
        {
          path: 'users/:username',
          Component: UsernameRoute,
          loader: async (args) => {
            // add the cookie header to the request
            args.request.headers.set('cookie', cookieHeader);
            return loader(args);
          },
        },
      ],
    },
  ]);

  const routeUrl = `/users/${user.username}`;
  await render(<App initialEntries={[routeUrl]} />);

  await screen.findByRole('heading', { level: 1, name: user.name! });
  await screen.findByRole('img', { name: user.name! });
  await screen.findByRole('button', { name: /logout/i });
  await screen.findByRole('link', { name: /my notes/i });
  await screen.findByRole('link', { name: /edit profile/i });
});
