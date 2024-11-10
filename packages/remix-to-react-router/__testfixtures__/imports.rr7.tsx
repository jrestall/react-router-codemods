// @ts-nocheck

import { redirect } from 'react-router';

import type { AppLoadContext, EntryContext } from 'react-router';

import {
  createSession,
  createCookieSessionStorage,
  createRequestHandler as nodeCreateRequestHandler,
  type ActionFunctionArgs,
} from 'react-router';

import { createFileSessionStorage, writeReadableStreamToWritable } from '@react-router/node';

import {
  json,
  type LoaderFunctionArgs,
  type HeadersFunction,
  type LinksFunction,
  type MetaFunction,
} from 'react-router';

import { getDomainUrl } from '#app/utils/misc.tsx';

import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useSubmit,
} from 'react-router';

import { createRequestHandler } from '@react-router/express';
import { createRoutesStub } from 'react-router';
import { createRoutesStub as aliasedRenamedImport } from 'react-router';

export function loader() {
  createRoutesStub();
  aliasedRenamedImport();
  return json({ message: 'hello' });
}
