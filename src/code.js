async function run(file, inFunc, outFunc, codeError) {
    var lines = file.split("\n").map(a => a.trim());

    var variables = [0, 0, 0, 0];
    var stack = [];

    const varMap = [
        "$",
        "%",
        "^",
        "@"
    ];

    function shift(val) {
        variables.splice(0, 0, val);
        variables.pop();
    }

    function convVar(name) {
        return variables[varMap.indexOf(name)];
    }

    function roll(d) {
        return (d + 256) % 256;
    } 

    const parse = (data) => /[$%^@]/.test(data) ? convVar(data) : Number(data);

    const labels = {};

    for (var pc = 0; pc < lines.length; pc++) {
        if (lines[pc][0] == "!") {
            if (lines[pc].split("!").filter(e => e).length === 0) {
                if (labels[lines[pc].trim()] !== undefined) {
                    codeError("Label already exists", pc);
                } else {
                    labels[lines[pc].trim()] = pc;
                }
            } else {
                codeError("Labels can only be !'s.", pc);
            }
        }
    }
    
    for (var pc = 0; pc < lines.length; pc++) {
        var line = lines[pc];

        if (line[0] == "=") {
            var expr = line.slice(1);
            var args = expr.split(/[+\-><&]/).filter(e => e.length > 0);
            
            if(args.length > 2 || !args.length) {
                codeError("Expected = <var|const> [<operator> <var|const>]. I.E. = 8 + %, or ^", pc);
            }
            
            if (args.length == 1) {
                shift(parse(args[0].trim()));
            } else {
                var op = expr.slice(args[0].length, args[0].length+1);
                
                args = args.map(e => e.trim());
                
                args = args.map(parse);
                
                var evaluated = 
                op == "+" ? args[0] + args[1] :
                op == "-" ? args[0] - args[1] :
                op == "&" ? ~(args[0] & args[1]) & 0xFF :
                op == "<" ? Number(args[0] < args[1]) :
                op == ">" ? Number(args[0] > args[1]) : 
                (() => {codeError("Unknown op: " + op); })();
                
                shift(evaluated);
            }
        } else if (line[0] == ".") {
            var data = line.slice(1);
            data = data.trim();
            
            if (data.length < 1) {
                codeError("Expected. <var|const>. I.E. . $", pc);
            }

            var evaluated = parse(data);
            
            outFunc(String.fromCharCode(evaluated));
        } else if (line[0] == ",") {
            shift(await Promise.resolve(inFunc()));
        } else if (line[0] == "~") {
            let variable = line.slice(1).trim();

            if(variable.length == 0) {
                codeError("A variable is required for pushing.", pc)
            } else stack.push(parse(variable));
        } else if (line[0] == "`") {
            let e = stack.pop();
            shift(e ?? 0);
        } else if (line[0] == ":") {
            if (variables[0] === 0) pc++;            
        } else if (line[0] == "|") {
            shift(Math.floor(Math.random() * 256));
        } else if (line[0] == "#" || line[0] == "!") continue;
        else if (line[0] == "?") {
            let lbl = line.slice(1).trim();

            if(!(lbl in labels)) codeError("No such label", pc);

            pc = labels[lbl];
        }

        // else if (line.trim().slice(0, 5) == "debug") {
        //     console.log(stack, variables);
        // }

        variables = variables.map(roll);
        stack = stack.map(roll);

    }
}

if (typeof module !== "undefined") module.exports = { run };
if (typeof window !== "undefined") window.BackwashRun = run;