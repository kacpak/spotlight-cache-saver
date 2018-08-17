#!/usr/bin/env node
'use strict';

const path = require('path');
const { copyCacheToOutput } = require('../lib');

const argv = require('yargs')
  .usage('$0', 'copies wallpapers from spotlight cache to desired location')
  .option('output', {
    alias: 'o',
    describe: 'output directory',
    default: path.resolve('spotlight-cache'),
    coerce: path.resolve
  })
  .help('help')
  .alias('help', 'h')
  .alias('version', 'v').argv;

copyCacheToOutput(argv.output);
