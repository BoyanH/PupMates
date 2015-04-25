module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-angular-gettext')
	grunt.loadNpmTasks('grunt-serve');

	grunt.initConfig({
		serve: {
	        options: {
	            port: 1234,
	            path: './server.js'
	        }
	    },
		nggettext_extract: {
			pot: {
				files: {
					'po/template.pot': ['**/*.jade']
				}
			}
		}
	});
};