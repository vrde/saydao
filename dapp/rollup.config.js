import * as fs from "fs";
import path from "path";

import alias from "@rollup/plugin-alias";
import builtins from "rollup-plugin-node-builtins";
import globals from "rollup-plugin-node-globals";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import json from "@rollup/plugin-json";
import livereload from "rollup-plugin-livereload";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import svelte from "rollup-plugin-svelte";
import { terser } from "rollup-plugin-terser";

//const PRODUCTION = !process.env.ROLLUP_WATCH;
const DEBUG = process.env.DEBUG === "1";
const NETWORK = process.env.NETWORK || "localhost";
const PRODUCTION = !DEBUG && NETWORK !== "localhost";
const dedupe = importee =>
  importee === "svelte" || importee.startsWith("svelte/");

console.log("Build frontend for network", NETWORK);
console.log("Production set to", PRODUCTION);

function onwarn(warning, warn) {
  // skip certain warnings
  if (warning.code === "EVAL") return;

  // Use default for everything else
  warn(warning);
}

function setAlias() {
  const projectRootDir = path.resolve(__dirname);
  return alias({
    resolve: [".svelte", ".js"],
    entries: [
      {
        find: "src",
        replacement: path.resolve(projectRootDir, "src")
      }
    ]
  });
}

function getConfig(production) {
  let gsn = {};
  let walletOptions = {};

  // Addresses from https://docs.opengsn.org/gsn-provider/networks.html
  if (NETWORK === "kovan") {
    walletOptions = {
      endpoint: "https://kovan.infura.io/v3/67571fc7518746c2a1472668d6633438",
      disableNativeAgent: false
    };
    gsn = {
      relayHubAddress: "0x2E0d94754b348D208D64d52d78BcD443aFA9fa52",
      stakeManagerAddress: "0x0ecf783407C5C80D71CFEa37938C0b60BD255FF8",
      penalizerAddress: "0x03b362db8d2bbc3C74F8d26a94DEE2A56e27F0d5",
      forwarderAddress: "0x6453D37248Ab2C16eBd1A8f782a2CBC65860E60B",
      paymasterAddress: "0x38489512d064106f5A7AD3d9e13268Aaf777A41c"
    };
  } else {
    walletOptions = {
      endpoint: "localhost",
      disableNativeAgent: true
    };
    try {
      gsn = JSON.parse(fs.readFileSync("../eth/gsn.json"));
    } catch (e) {
      if (e.code === "ENOENT") {
        console.log(`Cannot find ${e.path} file.`);
      }
    }
  }

  walletOptions.gsn = gsn;
  const ipfsEndpoint = production
    ? "https://ipfs.infura.io:5001"
    : "http://localhost:5001";

  return {
    production,
    date: new Date(),
    ipfsEndpoint,
    walletOptions
  };
}

export default {
  input: "src/index.js",
  // Import etherea as a umd external module to speed up build time.
  external: ["etherea", "ipfs-http-client"],
  output: {
    file: "build/bundle.js",
    format: "iife",
    sourcemap: true,
    globals: {
      etherea: "etherea",
      "ipfs-http-client": "ipfs-http-client"
    }
  },
  plugins: [
    replace({
      __buildEnv__: JSON.stringify(getConfig(PRODUCTION))
    }),
    copy({
      targets: [
        {
          src: "node_modules/ipfs-http-client/dist/index.min.js",
          dest: "build",
          rename: "ipfs-http-client.min.js"
        },
        { src: "node_modules/etherea/browser/etherea.min.js", dest: "build" },
        { src: "public/index.html", dest: "build" },
        { src: "public/classless.css", dest: "build" },
        { src: "public/style.css", dest: "build" },
        { src: "../docs/operation.md", dest: "build/docs" },
        { src: "../docs/principles.md", dest: "build/docs" }
      ]
    }),
    svelte({
      dev: !PRODUCTION,
      css: css => css.write("build/bundle.css")
    }),
    builtins(),
    globals(),
    setAlias(),
    json(),
    // rollup-plugin-node-resolve embeds external dependecies in the bundle,
    // more info here:
    // https://rollupjs.org/guide/en/#warning-treating-module-as-external-dependency
    resolve({ browser: true, dedupe }),
    commonjs(),
    // https://github.com/thgh/rollup-plugin-serve
    !PRODUCTION &&
      serve({
        contentBase: "build",
        /*open: true,*/ host: "0.0.0.0",
        port: 4000
      }),
    !PRODUCTION && livereload("build"),
    PRODUCTION && terser()
  ],
  watch: {
    include: ["src/**", "public/**"],
    buildDelay: 500,
    clearScreen: true,
    chokidar: {
      usePolling: true
    }
  },
  onwarn
};
