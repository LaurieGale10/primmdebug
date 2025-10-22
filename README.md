# PRIMMDebug

An educational tool designed to teach secondary school students a reflective approach to debugging in a text-based programming language. Inspired by findings from my PhD project into beginner programmers' debugging strategies.

Built in [Angular CLI](https://github.com/angular/angular-cli) (originally in version 17.3.5), served by a [Firebase Firestore](https://firebase.google.com/docs/firestore) database and hosted with [Firebase hosting](https://firebase.google.com/docs/hosting) on https://primmdebug.web.app/.

## Development Setup

Run `ng serve` for a dev server and navigate to `http://localhost:4200/`. Currently, no data will load on the homepage due to the use of git-ignored environment variables for establishing a database connection (adding of sample data is a known issue, provisionally to be implemented by September 2025). In the meantime, feel free to investigate the source code!

### Building

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Contributing

Pedagogical/technical/UX suggestions are welcome! Just open up an [issue](https://github.com/LaurieGale10/primmdebug/issues) and tag it appropriately.

Pull requests are welcome but unlikely to be incorporated until September 2025.

## License

This repository is licensed under the terms of the [Apache 2.0 license](https://github.com/LaurieGale10/primmdebug/blob/main/LICENSE.md).
