'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-puglyfe:app', () => {
  beforeAll(() => {
    return helpers
      .run(path.join(__dirname, '../app'))
      .withPrompts({ci: {bitbucket: true}})
      .withPrompts({features: []});
  });

  it('creates files', () => {
    assert.file(['app/robots.txt']);
  });

  it('should generate the same appname in every file', () => {
    const name = path.basename(process.cwd());
    assert.fileContent('app/layouts/default.pug', 'title ' + name);
  });
});
