// @ts-nocheck

import { redirect } from "react-router";
import type { AppLoadContext, EntryContext } from "react-router";
import {
  json,
  type LoaderFunctionArgs,
  type HeadersFunction,
  type LinksFunction,
  type MetaFunction,
} from "react-router";
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
} from "react-router";
