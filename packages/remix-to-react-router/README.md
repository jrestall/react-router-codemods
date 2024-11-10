# Remix to React Router

This codemod automates most of the manual steps outlined in the Remix to React Router upgrade guide.

https://github.com/remix-run/react-router/blob/dev/docs/upgrading/remix.md

- It updates your dependencies from the @remix-run/* packages to react-router and @react-router/* packages in package.json and in your code where you import from packages.
- It handles moving removed imports from the host specific packages like @remix-run/architect, @remix-run/cloudflare etc and moving them to react-router.
- It updates the scripts in your package.json if you are using the basic scripts from the Remix templates, otherwise it won't change the scripts.
- It updates the import and renames the plugin in your vite.config.ts.
- If you have an entry.server.tsx and/or an entry.client.tsx file in your application, it will update the main components and imports in these files, including renaming remixContext to reactRouterContext.
