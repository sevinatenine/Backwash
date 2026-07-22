#!/usr/bin/env node

const fs = require("fs");
const code = require("./code");
const { exit } = require("process");

const possibleOptions = {
    "-o": {
        usage: "-o <stdout_file>",
        desc: "outputs to a file instead of stdout"
    },
    "-i": {
        usage: "-i <stdin_file>",
        desc: "takes stdin from a file"
    },
    "-h": {
        usage: "-h",
        desc: "shows help messages"
    }
};

const args = process.argv.slice(2);
let data = {};

function logOutput(...data) {

}

function logError(...data) {
    console.error(...data);
}

function fatal(...data) {
    logError(`[FATAL] `, ...data);
    exit(1);
}

function fatalNoExit(...data) {
    logError(`[FATAL] `, ...data);
}
 
function showHelp() {
    logError("Usage:");
    logError(`  npx backwash-lang <filename> [options]`);
    logError("Options:");

    for (var i of Object.keys(possibleOptions)) {
        logError(`  ${i}\t ${possibleOptions[i].desc}\n    Usage: ${possibleOptions[i].usage}`);
    }

    exit(1);
}

function codeError(err, lineNumber) {
    logError(`Error on line ${lineNumber + 1}: ${err}`);
    exit(1);
}

for (i = 0; i < args.length; i++) {
    if (args[i] == "-h") {
        showHelp();
    }
    
    if(args[i] == "-o") {
        if(data.out) {
            fatal("Output file already specified.");
        }
        
        if(args[i + 1]) {
            data.out = args[i + 1];
            i++;
            continue;
        }

        fatal("No output file specified.");
    } 
    
    if(args[i] == "-i") {
        if(data.in) {
            fatal("Stdin input file already specified.");
        }
        
        if(args[i + 1]) {
            data.in = args[i + 1];
            i++;
            continue;
        }
        
        fatal("No stdin input file specified.");
    }

    if (!data.prog) {
        data.prog = args[i];
        
        continue;
    }
    
    fatal("Program file already specified.")
}

if (!data.prog) {
    fatalNoExit("No program file specified");
    showHelp();
}

try {
    var file = fs.readFileSync(data.prog, "utf-8");
} catch (e) {
    fatal("Failed to open program file.");
}

let inFd = 0;   // stdin
let outFd = 1;  // stdout

if (data.out) {
    try {
        outFd = fs.openSync(data.out, "w");
    } catch (e) {
        fatal("Failed to open out file.");
    }
}

if (data.in) {
    try {
        inFd = fs.openSync(data.in, "r");
    } catch (e) {
        fatal("Failed to open input file.");
    }
}
function inFunc() {
    const buf = Buffer.alloc(1);

    while (true) {
        try {
            const bytes = fs.readSync(inFd, buf, 0, 1, null);

            if (bytes === 0) return 0;

            const val = buf[0];

            // strip newline + carriage return
            if (val === 10 || val === 13) {
                continue;
            }

            return val;
        } catch (e) {
            if (e.code === "EAGAIN") {
                continue; // wait until input is available
            }
            throw e;
        }
    }
}

function outFunc(char) {
    try {
        fs.writeSync(outFd, char);
    } catch (e) {
        console.error("How the **ck did you **ck it up that **cking bad?????? (I mean heck)", e);
    }
}

code.run(file, inFunc, outFunc, codeError);