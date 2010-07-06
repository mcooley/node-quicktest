var sys = require('sys'),
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
		sys.puts('	' + colors.bold.green + 'OK: ' + colors.reset + description);
		process.removeListener('uncaughtException', that.fail);
		that.callback(true);
	};

	this.fail = function (err) {
		sys.puts('	' + colors.bold.red + 'FAIL: ' + colors.reset + description + '\n' + err.stack);
		process.removeListener('uncaughtException', that.fail);
		that.callback(false);
	};
}

//////////////////

function TestQueue(desc, tests, cleanup) {
	var that = this;

	this.cleanup = cleanup;
	
	this.results = {queue: tests.length, pass: 0, fail: 0};

	var keepScore = function (result) {
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
//TEST CODE
var m1 = new TestQueue('test q1', [new Test('test 1', function(cb){cb();}), new Test('test 2', function(cb){throw new Error('hi');})], function(cb){sys.puts('cleaned up!'); cb();});

var m2 = new TestQueue('test q2', [new Test('test 3', function(cb){cb();}), new Test('test 4', function(cb){throw new Error('hi');})], function(cb){sys.puts('cleaned up!'); cb();});

var main = new TestQueue('test main', [m1, m2], function(cb){sys.puts('cleaned up!'); cb();});

main.run(function(){sys.puts('done!');});
