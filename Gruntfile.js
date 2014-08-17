module.exports = function (grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-docular');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: '',
        banner: grunt.file.read('src/thickm/thickm.prefix'),
        process: function(src, filepath) {
          return '// Source: ' + filepath + '\n' +
              src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
        }
      },
      library: {
        src: [
        'src/**/*.module.js',
        'src/**/*.provider.js',
        'src/**/*.factory.js',
        'src/thickm/thickm.suffix'
        ],
        dest: 'dist/angular-thickm.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      jid: {
        files: {
          'dist/angular-thickm.min.js': ['<%= concat.library.dest %>']
        }
      }
    },
    jshint: {
      beforeConcat: {
        src: ['gruntfile.js', 'angularThickm/**/*.js']
      },
      afterConcat: {
        src: [
        '<%= concat.library.dest %>'
        ]
      },
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true,
          angular: true
        },
        globalstrict: false
      }
    },
    watch: {
      options: {
        livereload: true
      },
      files: [
      'Gruntfile.js',
      'src/**/*'
      ],
      tasks: ['default']
    },
    docular: {
      useHtml5Mode: false,
      'docular_webapp_target': '/docs',
      showAngularDocs: false,
      showDocularDocs: true,
      examples: {},
      groups: [
        {
          groupTitle: 'Thickm Docs',
          groupId: 'thickm',
          sections: [
            {
              id: 'resource',
              title: 'Resource',
              scripts: [
                'src/thickm/resource/resource.module.js',
                'src/thickm/resource/resource.provider.js'
              ],
              docs: [],
              rank: {}
            }
          ]
        }
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'jshint:beforeConcat',
    'concat',
    'jshint:afterConcat',
    'uglify',
  ]);
  grunt.registerTask('livereload', ['default', 'watch']);
  grunt.registerTask('docs', ['docular']);

};
