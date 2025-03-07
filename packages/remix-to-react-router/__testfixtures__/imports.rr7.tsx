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
import { useLocation, useNavigate, Route, Switch } from 'react-router';
import { flatRoutes } from '@react-router/fs-routes';
import type { RouteConfig } from '@react-router/dev/routes';
import { remixRoutesOptionAdapter } from '@react-router/remix-routes-option-adapter';
const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");
import createRoutesFromFolders2 from "@remix-run/v1-route-convention";

export const routes: RouteConfig = flatRoutes();

export function loader() {
  createRoutesStub();
  aliasedRenamedImport();
  return json({ message: 'hello' });
}
