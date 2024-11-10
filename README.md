# react-router-codemods

This repo provides codemods for migrating from Remix to React Router v7.

See the README at [remix-to-react-router/README.md](./packages/remix-to-react-router/README.md) for details.

## Example

Please see the commit [here](https://github.com/jrestall/epic-stack/commit/3fac92aed4c4a987b5b00e33257d3a3d9bc61372) that uses the `epic-stack` as an example of the changes the codemod `remix/2/react-router/upgrade` will make.

## Running

1. Install Codemod: https://docs.codemod.com/deploying-codemods/cli#installation
2. Run `codemod remix/2/react-router/upgrade` on the path you want to modify.

## Publishing

```bash
cd packages/remix-to-react-router
codemod login
codemod publish
```

## License

This project is licensed under the [MIT License](LICENSE).
