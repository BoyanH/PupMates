module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-angular-gettext')
	grunt.loadNpmTasks('grunt-serve');
	grunt.loadNpmTasks('grunt-contrib-jade');

	grunt.initConfig({
		serve: {
	        options: {
	            port: 1234,
	            path: './server.js'
	        }
	    },

	    jade: {
	        compile: {
	            options: {
	                client: false,
	                pretty: true
	            },
	            files: [ {
	              cwd: "public/app",
	              src: "**/*.jade",
	              dest: "translations/templates",
	              expand: true,
	              ext: ".html"
	            } ]
	        }
	    },

		nggettext_extract: {
			pot: {
				files: {
					'po/template.pot': ['**/*.html']
				}
			}
		},
		nggettext_compile: {
			all: {
				files: {
					'public/app/translations/translations.js': ['po/*.po']
				}
			}
		}
	});
};