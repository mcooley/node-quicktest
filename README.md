Quicktest is a simple testing framework for node.js.

Quicktest is a single file that, when run, searches the directory tree to find test files, which end in ".test.js". Organize the tests however you'd like. 

.test.js files are just node modules. They look like this:
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

Use whatever assert library you'd like (there's one built in to node).

To run the tests, place node-quicktest.js in the root directory of your project and run:
	node node-quicktest.js

Quicktest gives a pretty colored terminal output, which was inspired by botanicus's minitest: http://github.com/botanicus/minitest.js

==License==
(the BSD license)
Copyright (c) 2010, Matt Cooley
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of the <ORGANIZATION> nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
