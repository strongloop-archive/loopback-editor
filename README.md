**DEPRECATED AS OF 2016-09-19**

---

# LoopBack Editor

A web-based frontend for building and maintaining LoopBack Projects.

## Setup

 1. Clone this repository: `git clone https://github.com/strongloop/loopback-editor`
 1. Inside the new `loopback-editor` directory, install the development dependencies: `npm install`
 1. **To run**, use the built-in development server: `npm start`. _This includes a bundled Workspace server, so no external Workspace server is necessary._
 1. **To deploy**:
    1. If deploying for small team usage, the development server is more than sufficient. Configure your environment accordingly.
    1. If deploying for larger groups, see [Workspace](https://github.com/strongloop/loopback-workspace) for instructions on running a Workspace server. At this point, edit `public/config.js` with your Workspace server information, and serve the `public` folder through your CDN or webserver of choice.

## Configuration

For the default configuration and details on all available options, see `public/config.js`.
