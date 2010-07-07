//Init code here

exports.tests = {
	'should pass': function (finished) {
		//test stuff
		finished(); //call the callback that was passed in as an argument
	},
	'should fail': function (finished) {
		//test stuff
		throw new Error('F is for failure!');
	},
	'async code works too': function(finished) {
		process.nextTick(function () {
			finished();
		});
	}
}

exports.cleanup = function (finished) {
	//This is optional. It will run when all the tests are finished.
	finished(); //cleanups can be async too, so report when you're done
}
