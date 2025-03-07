// @ts-nocheck

import { redirect } from '@remix-run/node';
import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';
import {
  createSession,
  createFileSessionStorage,
  createCookieSessionStorage,
  createRequestHandler as nodeCreateRequestHandler,
  type ActionFunctionArgs,
  writeReadableStreamToWritable,
} from '@remix-run/node';
import {
  json,
  type LoaderFunctionArgs,
  type HeadersFunction,
  type LinksFunction,
  type MetaFunction,
} from '@remix-run/node';
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
} from '@remix-run/react';
import { createRequestHandler } from '@remix-run/express';
import { createRemixStub } from '@remix-run/testing';
import { createRemixStub as aliasedRenamedImport } from '@remix-run/testing';
import { useLocation, useNavigate, Route, Switch } from 'react-router-dom';
import { flatRoutes } from "@remix-run/fs-routes";
import type { RouteConfig } from "@remix-run/route-config";
import { remixRoutesOptionAdapter } from '@remix-run/routes-option-adapter';
const { createRoutesFromFolders } = require("@remix-run/v1-route-convention");
import createRoutesFromFolders2 from "@remix-run/v1-route-convention";

export const routes: RouteConfig = flatRoutes();

export function loader() {
  createRemixStub();
  aliasedRenamedImport();
  return json({ message: 'hello' });
}
