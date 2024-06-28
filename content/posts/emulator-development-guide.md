---
title: 'Emulator Development Guide'
date: 2024-06-27
draft: false
---

# Emulator Development Guide

I've recently started my first full-time job that's not an internship or research at a university, so I feel like I've finally gained some baseline credbility to be able to diffuse some of my knowledge back to the community. I was introduced to emulation at a young age by an older sibling, and I had a dream at age 5 to build a Gameboy emulator myself. I fulfilled that a few years ago, but I learned a lot along the way and I want to try and present things as I understand them in case it helps anybody. My goal is to have easy-to-follow, comprehensive guides for several of the most popular video game consoles from the 1980s, 1990s, and early 2000s. I will provide step-by-step instructions, along with source code in several languages: C++, Java, Python, Rust, OCaml, and Swift. The order below is the order in which we'll build these emulators, starting out with the simple CHIP-8 system. I think you'll find the first project an easy to tackle, but rewarding experience. It will also introduce a lot of the concepts that we'll need for the more "real" video game systems. Emulators 1-5 are solid mid-size projects that you can put on your resume, but if you make it all the way to the Nintendo DS and beyond, you're certainly in the "large, impressive" project category range.

{{< admonition info >}}
As of 6/27/2024, I'm halfway through writing the first post, about the CHIP-8, and I've written the code for it in 4/6 languages. I'm going to try to finish the Gameboy Color and NES articles by the end of the summer. I'm including this note so I can hold myself accountable for getting it done.
{{< /admonition >}}

## Roadmap
1. [Crawling: CHIP-8](/posts/chip-8/)
2. [First Steps: Gameboy / Gameboy Color](/posts/gameboy-color)
3. [Walking: NES](/posts/nintendo-entertainment-system)
4. [Running: SNES](/posts/super-nes)
5. [Biking: Gameboy Advanced](/posts/gameboy-advanced)
6. [Driving: Nintendo DS](/posts/nintendo-ds)
7. [Flying: Nintendo 64](/posts/nintendo-64)
8. [Teleporting: PlayStation 1](/posts/playstation-one)

I plan on having every line of code for each system in all the languages available on GitHub and all of the code related to logic in the posts, but I highly encourage you to take a first pass at the components without looking at the code. Only consult my code (or any other emulator's code) once you've tried debugging but are stuck. Hopefully, you're reading this because you're looking for a very challenging, but also extremely rewarding programming project. You'll find that writing emulators ticks both those boxes, with the bonus of the satisfaction of playing classic games on software you've built yourself.

## What Exactly is an Emulator?

If you've never used an emulator before, you should probably go and try one right now so you have an idea of what exactly you're going to be building. Wikipedia's definition for [emulators](https://en.wikipedia.org/wiki/Emulator) states that it's "hardware or software that enables one computer system (called the *host*) to behave like another computer system (called the *guest*)." What we'll be doing is *emulating* the hardware of various video game consoles so that you can play games for those systems on your computer.

>Check out **Visual Boy Advance (VBA)** or **DeSmuME** for examples of popular, well-built emulators. If you're on a mobile device, check out **Delta**. Of course, for each of these you'll have to provide your own ROMs (basically executable dumps of the GBA or DS cartridges in this case), which I believe can only legally be done if you already own the physical versions of the games you want. Google "GBA roms" or "NDS roms" to get more information on that.

Since an emulator recreates the entire functionality of a system, we'll have to implement all the components of the system too. For the consoles we'll handle, there might be components like the Central Processing Unit (CPU), Picture Processing Unit (PPU), Audio Processing Unit (APU), and so on. What's nice is that these components provide a sensible template for organizing your code among separate files. Of course, the most important one is the CPU, which handles executing the instructions that are contained in **ROMs** and keeping the system organized. 

### ROMs

The game cartridges for the NES, Gameboy, and others are physical data that you plug into your consoles. So how are we going to emulate that functionality on a modern computer? The answer is by using **ROMs**, which you can think of as compiled, machine-code binaries that are dumped from those actual physical cartridges. When we read these binary files into our emulator programs, we will place them in our programs' memory (at least for the first few emulators, where the size of the ROMs isn't a limitation on modern hardware). A ROM when viewed as a stream of bytes, contains machine code instructions for the processor of the console -- that's what allows your Gameboy to actually play the game. Those machine code intructions map to processor-specific **assembly language instructions**, the next level of abstraction. These **opcodes** are much easier to work with when you write byte values in hexadecimal. A single unsigned byte in hex ranges from `0x00` to `0xFF`, or 0 to 255 in decimal.

{{< admonition tip >}}
Check out my information about thinking about hexadecimal below if you're not familiar. I also encourage you to find other resources online, since they'll explain it far better than I can and having a solid understanding of hexadecimal values is worth its weight in gold when writing emulators.
{{< /admonition >}}

The best way to understand is by trying it out; I encourage you to use a lightweight hex editor, such as [HxD](https://mh-nexus.de/en/hxd/) if you're on Windows, to view various ROMs and see what they look like. You'll see something like this:

```
CE ED 66 66 CC 0D 00 0B 
03 73 00 83 00 0C 00 0D
00 08 11 1F 88 89 00 0E 
DC CC 6E E6 DD DD D9 99
BB BB 67 63 6E 0E EC CC 
DD DC 99 9F BB B9 33 3E
```

These 48 bytes are part of the header on every Gameboy ROM and contain the bitmap image for scrolling Nintendo logo. So, the bytes of these ROMs is the smallest unit of instruction that we'll work with. For 8-bit systems like the CHIP-8 and Gameboy, each byte will correspond to a specific instruction, like `ADD x,y`, where `x` and `y` are two **registers** in the CPU.

### Registers

I was writing the sentence right above this and realized, "shoot I need to include a section explaining what registers are." Registers are small, fast data stores in a processor that act as variables and carry out the operations that the processor is instrucuted to do. The consoles that we write all have different amounts and sizes of registers. The first console, CHIP-8, has 16 general-purpose registers named `V0`-`VF` that each one byte, meaning they have a maximum value of `0xFF`. Note that general-purpose means they can be used for a myriad of calculations. Some consoles will have special registers that are meant for special purposes. The CHIP-8, for example, will have a 16-bit (2 byte) register called the index register, which points to locations in the console's memory.

### The Stack

All consoles have an internal stack -- which is just like the data structure. You can *push* values onto it and *pop* values off of it. This stack is used when calling subroutines, just like your computer does when you call functions in your programs. If you're familiar with recursion, you probably know about the potential of a **stack overflow**, where the stack is full and you try to place a value on top of it. All of the emulators we'll be writing have stacks much smaller than the computer you are reading this with.

{{< admonition info >}}
You can implement the stack in a couple of ways, including using a stack data structure in whatever language you're working with. What I'll be doing in my implementations is having a simple array with an extra variable called the **stack pointer**, which will keep track of where in the stack we are.
{{< /admonition >}}

### The Main Loop

When you turn your Gameboy on, it doesn't turn off until you do so physically. So how do we emulate this functionality? The answer is with something called the **fetch-decode-execute loop**, which just means that our program will have a `while` loop running infinitely until we tell it to stop. Inside that loop, we will *fetch* the next instruction at the program counter, *decode* it to find out which instruction we need to call, and *execute* it by calling the necessary function (or however else you implement it). Also inside this loop, we'll keep track of everything else we need to, such as reading when a relevant key has been pressed and redrawing to the screen if necessary.

### Program Counter

The term I just used above, **program counter** (PC) is a variable that refers to where we should execute the next instruction in our emulator. Like the index register, the PC will point to a location in memory. However, this location is where we will read the next byte(s) to be processed as instructions/data.  

## Tips

### Graphics Libraries

Since video game consoles draw pixels, sprites, and models to screens, we'll need some way of doing the same thing. Depending on the language you choose, there are a plethora of options available to you, but I'll be using [SDL](https://www.libsdl.org/), [OpenGL](https://www.opengl.org/), and [SpriteKit](https://developer.apple.com/spritekit/), depending on the language and platform I'm building for. You'll likely want to find other online resources to learn more about them, as I'll only be giving you basic setup advice. Just search online on how to get a basic window up and running first, then find out how to draw to the screen. For the simple emulators, you can find out how to create a texture, write the pixels of the console you're emulating to the texture, and then render the texture to your application's window. I think you'll find that it's probably simpler than you think it is.

### Bit Manipulation + Bitwise Operations

By the time you're done with a couple emulators, you'll be an expert in bit manipulation and how to extract the information you need from integers of specific sizes. There are tons of resources out there about this topic, but [here's] a link to a page on GitHub explaining what I'm about to do below as well. As I'm sure you know, a computer stores numbers (and everything else) as bytes, which are composed of 8 bits each. 

>Note the difference between *unsigned* and *signed* values! The language you're working with will likely have separate data types of the two, but it may not, or they may not be convenient to use, in which case you'll have to be even more careful. As the name suggests, *signed* integers have a sign --- that is, they can have negative values --- whereas *unsigned* integers do not. For example, a *signed* 8-bit (i.e. one byte) integer can contain values from -127 to 128, while an *unsigned* 8-bit integer can hold values from 0 to 255.

There are a few operations that we can do "bitwise", meaning bit-by-bit, and every programming language has support for these operators, although the syntax will vary. For the six languages we'll be using, here are the bitwise operators:

| Language | Operators |
| ----------- | ----------- |
| C++ | `&`, <code>&#124;</code>, `^`, `>>`, `<<`, `!` |
| Python | `&`, <code>&#124;</code>, `^`, `>>`, `<<`, `!` |
| Java | `&`, <code>&#124;</code>, `^`, `>>`, `<<`, `!` |
| Swift | `&`, <code>&#124;</code>, `^`, `>>`, `<<`, `!` |
| OCaml | `land`, `lor`, `lxor`, `lsr`, `lsl`, `lnot` |
| Rust | `&`, <code>&#124;</code>, `^`, `>>`, `<<`, `!` |

You'll notice that OCaml is the only language of the six that has a different syntax for the operators.

{{< admonition warning >}}
A common source of bugs when writing emulators is the differences in operator precedence across languages. For example, in C++ the `>>` operator has higher precedence than the `&` operator, so if you have an expression like `a & b >> 8` (which you'll see a lot of very soon in the CHIP-8 guide), the value of `b` is shifted right by 8 **BEFORE** it is logically `AND`ed wth `a`. In fact, when we get to the CHIP-8 stuff, you'll see that what we usually want is `(a & b) >> 8`. Note that not all of the languages have the same precedence you expect, and it can be a frustrating problem to debug in complicated expressions.
{{< /admonition >}}

{{< admonition tip >}}
Most programming languages will also support operators for bitwise operation and assignment. For example, just as `a += b` adds the value of `b` to `a` and stores it back in `a`, `a &= b` will perform a bitwise AND of `a` and `b` and store the result back in `a`.
{{< /admonition >}}

#### Bitwise AND

Let's say we have two 8-bit unsigned integers `a` and `b`, and they have the following values in binary:

```
a = 01011011
b = 10010001
```

As you may know, the leading zeroes can be omitted from binary values (just like they can be in decimal or hexadecimal), but I'll leave them in for clarity. The bitwise `AND` operation returns 1 if both values have a value of 1 and 0 for all three other cases. So in the example above, `a & b` will yield:

```
a =     11011011
b =     10010001
a & b = 10010001
```

#### Bitwise OR

Let's say we have two 8-bit unsigned integers `a` and `b`, and they have the following values in binary:

```
a = 01011011
b = 10010001
```

The bitwise `OR` operation returns 1 if EITHER bit is 1 and 0 in the case that both bits are 0. So in the example above, `a | b` will yield:

```
a =     11011011
b =     10010001
a | b = 11011011
```

#### Bitwise XOR

Let's say we have two 8-bit unsigned integers `a` and `b`, and they have the following values in binary:

```
a = 01011011
b = 10010001
```

The bitwise `XOR` operation, called the "exclusive OR", is like `OR` but excludes the case where both bits are the same. In other words, it returns 1 if both bits are different and 0 if both bits are the same. So in the example above, `a ^ b` will yield:

```
a =     11011011
b =     10010001
a ^ b = 01001010
```

#### Logical Shift Left

Let's say we have an 8-bit unsigned integer `a` that has the following value in binary:

```
a = 10110101
```

The logical shift left operation "shifts" the bits over to the left by the specified amount. For example, if we write `a << 1`, we shift the bits over to the left by one place. Note that the left-most bit in this case is lost, and the right-most bit that is filled is a 0:

```
a =      10110101
a << 1 = 01101010
```

#### Logical Shift Right

Let's say we have an 8-bit unsigned integer `a` that has the following value in binary:

```
a = 10110101
```

The logical shift right operation "shifts" the bits over to the right by the specified amount. For example, if we write `a << 1`, we shift the bits over to the right by one place. Note that the right-most bit in this case is lost, and the left-most bit that is filled is a 0:

```
a =      10110101
a >> 1 = 01011010
```

#### Logical NOT

The logical `NOT` operator simply negates (flips) the bits of the value. For example, `!a` yields:

```
a =  10110101
!a = 01001010
```

### Bit Masking

One neat feature of the logical operator `AND` is that it can be used to extract relevant information from a value. For example, let's say we had the 8-bit value `0xFE`, which corresponds to 254 in decimal. If we were to write this in binary, it would be `11111110`. Now, let's say that we wanted to get the lower four bits of this value, i.e. `1110`. One way we could do that is by `AND`ing the value with `0xF`. THis works because `AND` returns 1 if both values are 1 and 0 otherwise. Since `0xF` is `1111` in binary, or `00001111` written as a whole byte, taking the logical `AND` will return 0 for bits that are not of interest and will return the bits that *are* of interest unchanged. Here's what that looks like in action:

```
    11111110
AND 00001111
=   00001110
```

### Hexadecimal

It's worth its weight in gold to become comfortable with hexadecimal representations of numbers, especially with regards to bit masking and setting. Just as binary values can take on either 0 or 1, and decimal values can take on 0 through 9, hexadecimal, which is base 16, can take on values of 0 through 15 for each hex digit. However, since we only want a single character for each value, 10 through 15 are represented as the letters `A` through `F`, where `A` is 10 and `F` is 15. You'll also see the notation convention of beginning hexadecimal values with `0x`. Likewise, if you have binary numbers you can prepend them with `0b` to denote that they are binary values.