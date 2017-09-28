'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('skip-welcome-message', {
      desc: 'Skips the welcome message',
      type: Boolean
    });

    this.option('skip-install-message', {
      desc: 'Skips the message after the installation of dependencies',
      type: Boolean
    });
  }

  initializing() {
    this.pkg = require('../package.json');
  }

  prompting() {
    if (!this.options['skip-welcome-message']) {
      this.log(
        yosay('\'Sup? Welcome to the ' + chalk.red('puglyfe') + ' generator!')
      );
    }

    const prompts = [
      {
        type: 'checkbox',
        name: 'features',
        message: 'What stuff do you want?',
        choices: [
          {
            name: 'include-media',
            value: 'includeIncludeMedia',
            checked: true
          },
          {
            name: 'Bulma',
            value: 'includeBulma',
            checked: false
          },
          {
            name: 'BassCss',
            value: 'includeBassCss',
            checked: false
          },
          {
            name: 'Bootstrap',
            value: 'includeBootstrap',
            checked: false
          },
          {
            name: 'Modernizr',
            value: 'includeModernizr',
            checked: true
          },
          {
            name: 'Greensock',
            value: 'includeGreensock',
            checked: false
          }
        ]
      },
      {
        type: 'confirm',
        name: 'includeJQuery',
        message: 'Would you like to include jQuery?',
        default: true,
        when: answers => answers.features.indexOf('includeBootstrap') === -1
      },
      {
        type: 'list',
        name: 'ci',
        message: 'What CI service do you want to include?',
        choices: [
          {
            name: 'Bitbucket Pipelines',
            value: 'bitbucket',
            checked: true
          },
          {
            name: 'Gitlab',
            value: 'gitlab',
            checked: false
          }
        ]
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;

      // Map configuration to something a little easier to use.
      this.includeJQuery = props.includeJQuery;
      this.features = {
        includeBassCss: this._hasOption('features', 'includeBassCss'),
        includeBootstrap: this._hasOption('features', 'includeBootstrap'),
        includeBulma: this._hasOption('features', 'includeBulma'),
        includeGreensock: this._hasOption('features', 'includeGreensock'),
        includeIncludeMedia: this._hasOption('features', 'includeIncludeMedia'),
        includeModernizr: this._hasOption('features', 'includeModernizr')
      };
      this.ci = {
        bitbucket: this._hasOption('ci', 'bitbucket'),
        gitlab: this._hasOption('ci', 'gitlab')
      };
    });
  }

  writing() {
    this._writingGulpfile();
    this._writingPackageJSON();
    this._writingBabel();
    this._writingGit();
    this._writingCI();
    this._writingEditorConfig();
    this._writingH5bp();
    this._writingStyles();
    this._writingScripts();
    this._writingHtml();
    this._writingMisc();
  }

  _hasOption(haystack, needle) {
    // Example: _hasOption('features', 'includeBootstrap');
    return this.props[haystack] && this.props[haystack].indexOf(needle) !== -1;
  }

  _writingGulpfile() {
    this.fs.copyTpl(
      this.templatePath('gulpfile.tpl.js'),
      this.destinationPath('gulpfile.js'),
      {
        date: new Date().toISOString().split('T')[0],
        name: this.pkg.name,
        version: this.pkg.version,
        includeBootstrap: this.features.includeBootstrap
      }
    );
  }

  _writingPackageJSON() {
    this.fs.copyTpl(
      this.templatePath('package.tpl.json'),
      this.destinationPath('package.json'),
      {
        features: this.features,
        includeJQuery: this.includeJQuery
      }
    );
  }

  _writingBabel() {
    this.fs.copy(
      this.templatePath('babelrc.tpl'),
      this.destinationPath('.babelrc')
    );
  }

  _writingGit() {
    this.fs.copy(
      this.templatePath('gitignore.tpl'),
      this.destinationPath('.gitignore')
    );

    this.fs.copy(
      this.templatePath('gitattributes.tpl'),
      this.destinationPath('.gitattributes')
    );
  }

  _writingCI() {
    if (this.ci.bitbucket) {
      this.fs.copy(
        this.templatePath('bitbucket-pipelines.yml'),
        this.destinationPath('bitbucket-pipelines.yml')
      );
    }

    if (this.ci.gitlab) {
      this.fs.copy(
        this.templatePath('gitlab-ci.yml'),
        this.destinationPath('.gitlab-ci.yml')
      );
    }
  }

  _writingEditorConfig() {
    this.fs.copy(
      this.templatePath('editorconfig.tpl'),
      this.destinationPath('.editorconfig')
    );
  }

  _writingH5bp() {
    this.fs.copy(
      this.templatePath('favicon.ico'),
      this.destinationPath('app/favicon.ico')
    );

    this.fs.copy(
      this.templatePath('apple-touch-icon.png'),
      this.destinationPath('app/apple-touch-icon.png')
    );

    this.fs.copy(
      this.templatePath('robots.txt'),
      this.destinationPath('app/robots.txt')
    );
  }

  _writingStyles() {
    this.fs.copyTpl(
      this.templatePath('main.scss'),
      this.destinationPath('app/styles/main.scss'),
      {
        includeBootstrap: this.features.includeBootstrap
      }
    );

    if (this.features.includeBootstrap) {
      this.fs.copyTpl(
        this.templatePath('bootstrap.scss'),
        this.destinationPath('app/styles/_bootstrap.scss')
      );
    }
  }

  _writingScripts() {
    this.fs.copyTpl(
      this.templatePath('main.tpl.js'),
      this.destinationPath('app/scripts/main.js'),
      {
        includeBootstrap: this.features.includeBootstrap
      }
    );
  }

  _writingHtml() {
    let bsPath;
    let bsPlugins;

    // Path prefix for Bootstrap JS files
    if (this.features.includeBootstrap) {
      // Bootstrap 4
      bsPath = '/node_modules/bootstrap/js/dist/';
      bsPlugins = [
        'util',
        'alert',
        'button',
        'carousel',
        'collapse',
        'dropdown',
        'modal',
        'scrollspy',
        'tab',
        'tooltip',
        'popover'
      ];
    }

    mkdirp('app/layouts');
    this.fs.copyTpl(
      this.templatePath('layouts/default.tpl.pug'),
      this.destinationPath('app/layouts/default.pug'),
      {
        appname: this.appname,
        includeBootstrap: this.features.includeBootstrap,
        includeModernizr: this.features.includeModernizr,
        includeJQuery: this.includeJQuery,
        bsPath: bsPath,
        bsPlugins: bsPlugins
      }
    );

    this.fs.copyTpl(
      this.templatePath('index.tpl.pug'),
      this.destinationPath('app/index.pug'),
      {
        appname: this.appname
      }
    );
  }

  _writingMisc() {
    mkdirp('app/images');
    mkdirp('app/fonts');
  }

  install() {
    this.installDependencies({
      bower: false,
      npm: true,
      yarn: false,
      skipMessage: this.options['skip-install-message'],
      skipInstall: this.options['skip-install']
    });
  }
};
