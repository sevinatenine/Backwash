# Backwash
An esoteric language where every keyword and variable is one character.

Install with
```bash
npm install backwash-lang
```

Run with
```bash
npx backwash-lang <filename.bw>
```

The online interpreter is static HTML and JS that can run the language in the web. It is available in /playground.

Some examples are provided in /examples.

Run rock paper scissors from the project root directory with
```bash
npx backwash-lang examples/rock_paper_scissors.bw
```

> Fun fact: This project was created with no third-party node modules (except in the playground/online interpreter - where Monaco editor and Xterm.js were used for I/O).

**NOTE**: This project was also developed by @Cesium72 (on GitHub).

## Syntax

### Concepts

In Backwash, all numbers range from 0 to 255 and are unsigned uint8_t's and the variables store such numbers, as well as the stack.
When printing and reading input, it translates the number into an ASCII character and prints that character, rather than the number.

### Variables
In Backwash, there are 4 variables - `$`, `%`, `^`, and `@`.
They are specifically represented in this order because when you set the first variable, all of values get shifted into the next ones.

For example, if the variables look like `[1, 2, 3, 4]` - in the order of `[$, %, ^, @]`, then if you were to shift in the value `5`, the variables would look like `[5, 1, 2, 3]`.
The characters that shifts in a value is `=`.
You would use it like `= 5`.

You can also reference the variables in your code almost anywhere.
Fore example, you could do `= $` which would shift in the contents of the `$` variable.

### Input and Output

To print a character in Backwash, you use the `.` character. You can print the contents of a variable or a number (an inline constant).
For example, you could `. %` which would print the contents of `%` or you could `. 65` which would print `A`.

Reading input is done witht the `,` operator. This character reads a byte from STDIN, or wherever you choose with the arguments, and shifts that byte into the `$`.
It is used like `,` (i know - sooo complicated). 

### The Stack

Unlike a traditional stack, the Backwash stack does not let you read from a certain position in stack. You can only push and pop it.
However, you can push a variable or number, with `~`. I.E. `~ ^` or `~ 65`.
When you pop from it, the value is shifted into `$`. I.E. \`.

> NOTE: Popping from an empty stack will result in 0 being popped.

### Math Operators

In addition to shifting in variables or values into `$` with `=`, you can also use it to add, subtract, nand, and test greater than and less than.
The syntax is `= <var|const> <operator> <var|const>`.

**Adding**:
> The operator character is `+`

Examples:
```
= $ + 80
= % + 1
= 6 + 4
```

**Subtracting**:
> The operator character is `-`

Examples:
```
= @ - 10
= 70 - $
```

**NAND-ing**:
> The operator character is `&` (yes - its the opposite)

Examples:
```
= $ & @
= ^ & 0
```

**Greater-than-ing**:
> The operator character is `>`

Examples:
```
= $ > @
= 7 > @
```

**Less-than-ing**:
> The operator character is `<`

Examples:
```
= ^ < 90
= 5 < @
```

### Labels, Jumping and Skipping
A usefull operator is the `:` operator. It skips the next line (including blank lines) if `$` is `0`.
For example:
```
# Compare $ < 7
= $ < 7

# It is greater than or equal to 7 - skip the next line
:
# Do whatever/jump wherever
# This runs either way
```

If you want to make a label, you can use the `!` operator followed by any number of `!`'s after it.
Then, you can jump to it with the `?` operator followed by the sequence of `!`'s you want to jump to (the label name).
For example:
```
# Jump to label !!!!
? !!!!
# Declare label !!
!!
# Jump to label !!!
?!!!
# Declare label !!!!
!!!!
# Jump to label !!
?!!
# Declare label !!!
!!!
```

Comments are declared with `#` in front of any sequence of characters, numbers, spaces, etc. I.E. `# Hello, World!`

### Random numbers

To generate a random number from 0 - 255, use the `|` character. It generates a random number and shifts it into `$`.