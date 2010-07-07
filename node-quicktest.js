var sys = require('sys'),
	fs = require('fs'),
	colors = {
		reset: "\x1B[0m",

		grey:    "\x1B[0;30m",
		red:     "\x1B[0;31m",
		green:   "\x1B[0;32m",
		yellow:  "\x1B[0;33m",
		blue:    "\x1B[0;34m",
		magenta: "\x1B[0;35m",
		cyan:    "\x1B[0;36m",
		white:   "\x1B[0;37m",

		bold: {
			grey:    "\x1B[1;30m",
			red:     "\x1B[1;31m",
			green:   "\x1B[1;32m",
			yellow:  "\x1B[1;33m",
			blue:    "\x1B[1;34m",
			magenta: "\x1B[1;35m",
			cyan:    "\x1B[1;36m",
			white:   "\x1B[1;37m"
		}
	};

///////////////////
//Core objects
///////////////////

function Test(description, func) {
	var that = this;

	this.run = function (callback) {
		that.callback = callback;
		process.addListener('uncaughtException', that.fail);
		try {
			func(that.pass);
		}
		catch (err) {
			that.fail(err);
		}
	};

	this.pass = function () {
		sys.puts('    ' + colors.bold.green + 'OK: ' + colors.reset + description);
		process.removeListener('uncaughtException', that.fail);
		that.callback(true);
	};

	this.fail = function (err) {
		var error, stackTrimIndex, i;
		if (err.stack) {
			error = err.stack.split('\n');
			stackTrimIndex = error.length;			
			for (i = 0; i < error.length; i++) {
				if (error[i].substr(4, 11) === 'at Test.run') {
					stackTrimIndex = i + 1;
					break;
				}
			}
			error = error.slice(0, stackTrimIndex).map(function (str) { return '        ' + str; }).join('\n');
		}
		else {
			error = err;
		}
		sys.puts('    ' + colors.bold.red + 'FAIL: ' + colors.reset + description + '\n' + error);
		process.removeListener('uncaughtException', that.fail);
		that.callback(false);
	};
}

//////////////////

function TestQueue(desc, tests, cleanup) {
	var that = this,
		keepScore = function (result) {
			if (typeof result === 'object') {
				that.results.queue += result.queue;
				that.results.pass += result.pass;
				that.results.fail += result.fail;
			}
			else if (result === false) {
				that.results.fail++;
			}
			else if (result === true) {
				that.results.pass++;
			}
		};

	this.cleanup = cleanup;
	
	this.results = {queue: tests.length, pass: 0, fail: 0};

	this.run = function (callback) {
		that.callback = callback;
		sys.puts(colors.bold.yellow + '[' + desc + ']' + colors.reset);
		tests.shift().run(that.advance);
	};

	this.advance = function (result) {
		keepScore(result);
		if (tests.length > 0) {
			tests.shift().run(that.advance);
		}
		else if (that.cleanup) {
			var c = that.cleanup;
			that.cleanup = null;
			c(that.advance);
		}
		else {
			that.callback(that.results);
		}
	};

}

/////////////////////
//The script that runs everything
/////////////////////

var files = [], queues = [], numTests = 0;
var findFiles = function (dir) {
	fs.readdirSync(dir).forEach(function (file) {
		var path = dir + '/' + file;
		if (file.substr(-8, 8) === '.test.js') {
			files.push(path);
		}
		else if (fs.statSync(path).isDirectory())
		{
			findFiles(path);
		}
	});
};

findFiles(__dirname);

files.forEach(function (file) {
	var module = require(file.substr(0, file.length - 3)), tests = [], key;
	if (module.tests && typeof module.tests === 'object')
	{
		for (key in module.tests) {
			tests.push(new Test(key, module.tests[key]));
			numTests++;
		}
		if (tests.length < 1) {
			return;
		}
		if (module.cleanup) {
			queues.push(new TestQueue(file, tests, module.cleanup));
		}
		else {
			queues.push(new TestQueue(file, tests));
		}
	}
});

var endedGracefully = false;

var main = new TestQueue('Running ' + numTests + ' test' + (numTests === 1 ? '' : 's') + ' in ' + queues.length + ' file' + (queues.length === 1 ? '' : 's') + '...', queues);

process.addListener('exit', function () {
	if (!endedGracefully)
	{
		sys.puts(colors.bold.magenta + 'ERROR: The test suite is stopping prematurely. One of the tests may not have reported whether or not it succeeded.' + colors.reset);
	}
});

main.run(function (results) {
	endedGracefully = true;
	sys.puts('Finished ' + results.queue + ' tests. ' + results.pass + ' passed, ' + results.fail + ' failed.');
});
