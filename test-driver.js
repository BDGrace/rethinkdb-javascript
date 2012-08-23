var isNode = (typeof module !== 'undefined' && module.exports);

var exports;
var log;
var err;
var poslog;
if (isNode) {
    exports = global;
    var red = '\u001b[31m';
    var green = '\u001b[32m';
    var purple = '\u001b[35m';
    var reset = '\u001b[0m';

    exports.exit = function() {
        process.exit();
    };

    log = function(msg) {
        console.log(msg);
    }

    err = function(msg) {
        console.log('   '+red+msg+reset);
        console.trace();
    };

    poslog = function(msg) {
        console.log('   '+green+msg+reset);
    }

} else {
    exports = this;

    exports.exit = function() {
        throw '';
    };

    err = function(msg) {
        var div = document.createElement('div');
        div.style['color'] = 'red';
        div.innerHTML = '&nbsp&nbsp&nbsp'+msg;

        var d2 = document.createElement('div');
        var stack = (new Error()).stack;
        d2.innerHTML = stack;
        div.appendChild(d2);
        document.body.appendChild(div);
    };

    poslog = function(msg) {
        var div = document.createElement('div');
        div.style['color'] = 'green';
        div.innerHTML = '&nbsp&nbsp&nbsp'+msg;
        document.body.appendChild(div);
    };

    log = function(msg) {
        var div = document.createElement('div');
        div.innerText = msg;
        document.body.appendChild(div);
    };
}

function log(msg) {
    console.log(msg);
}

exports.fail = function(msg) {
    err('failed with message: '+msg);
    exit();
}

function assertEquals(expected, val) {
    if (expected !== val) {
        fail("Value "+val+" expected to equal "+expected);
    }
}

exports.aeq = function(eq) {
    wait();
    return function(val) {
        assertEquals(eq, val);
        done();
    };
}

exports.objeq = function(eq) {
    wait();
    return function(val) {
        for (var key in eq) {
            if (eq.hasOwnProperty(key)) {
                if (!val.hasOwnProperty(key) ||
                    val[key] !== eq[key]) {
                        fail('objects differ in key '+key);
                }
            }
        }
        done();
    };
}

var currentTest = '';
var waitCount = 0;
exports.wait = function() {
    waitCount++;
}

exports.done = function() {
    waitCount--;
}

exports.runTests = function(tests) {
    function runTest(testFun) {
        if (!testFun) return;
        currentTest = testFun.name;

        function cont() {
            poslog("passed");
            runTest(tests.shift());
        }

        log("Running test: "+testFun.name);
        try {
            testFun();
            var waitPeriods = 0;
            (function waitPeriod() {
                if (waitCount > 0 && waitPeriods < 10) {
                    setTimeout(waitPeriod, 100);
                } else if (waitPeriods >= 10) {
                    fail('timedout');
                } else {
                    cont();
                }
            })();
        } catch (e) {
            fail('threw exception '+e);
        }
    }
    runTest(tests.shift());
}
