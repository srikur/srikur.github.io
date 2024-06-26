---
title: 'Project 0: CHIP-8 Emulator'
date: 2024-06-04
draft: true
---

# Introduction

Hopefully you've read the intro this series [here](/posts/emulator-development-guide) and you know have at least a basic idea of what an emulator is about and what the roadmap is. To condense the plan into one sentence, our goal is to emulate the functionality of a game system programmatically by having an endless loop where we fetch low level instructions from ROMs (i.e. game cartridge binary dumps), execute those instructions, and repeat, updating the screen graphics as necessary. This is exactly what the real consoles due at the hardware level.

Our road to becoming qualififed emulator developers begins with the CHIP-8. In the 1970s, Joseph Weisbecker developed CHIP-8 as an interpreted programming language for use on a couple of 8-bit microcomputers. The reason that we are going to start our emulator development journey by building the CHIP-8 virtual machine is that it will introduce the concepts needed for the more compicated systems. It's also very feasible to get it running on day one if you dedicate some focused hours to it.

# System Specification

Let's quickly go over the tehcnical aspects of the CHIP-8 system. Check out [this](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM) link for far nore details if you're interested.

## Memory

The CHIP-8 has 4096 bytes of memory, which is `0xFFF` in hexadecimal. However, CHIP-8 programs dont address their memory before `0x200`, the first 512 bytes. That first half-kilobyte used to be where the interpreter was stored, but we don't need to do anything about that. Instead, we will load the **fonts** (more details below) into that first section and then load the ROM's data starting at `0x200`.

## Instructions

All CHIP-8 instructions are two bytes, meaning we will read them as is into a 16-bit integer into the **program counter**, with minimum and maximum values of `0x0000` and `0xFFFF`, respectively. However, as you'll see when we get into the actual instructions and their values, the actual domain of possible values is much more limited. 

## Registers

There are 16 general purpose 8-bit registers called `V0` through `VF` (i.e. `V15`), along with a single 16-bit *index* register. This index register will be used to point to locations in memory, which a program might access for whatever reason it needs. The register `VF` is also referred to as the *flag* register, since it's value been set or not set (i.e. 1 or 0) is used by programs to know when certain conditions are met. You'll understand what I mean by this when we get into the actual implementation of the instructions. 

Of course, there is also the 16-bit **program counter**, which points to a location in the memory from which we should read our next instruction, the subsequent two bytes.

## Input

The computers than originally ran the CHIP-8 interpreter had 16 keys, from 0-F, arranged like so:

```
+---------+
| 1 2 3 C |
| 4 5 6 D |
| 7 8 9 E |
| A 0 B F |
+---------+
```

Since modern computer keyboards have far more keys, you can choose what 16 keys you want to map those to. It should probably be keys that are in a 4x4 grid so it aligns with the layout of the original.

## Graphics

The screen size for CHIP08 systems is 64x32 pixels, for a total of 2048, or `0x148`. So, you can have a 2-dimensional array if you want, but you can also simply represent this as a 1-dimensional array and accessing the element at the coordinates (x,y) using `y * 64 + x`. When it comes to rendering, I've opted for the solution of creating a texture from the pixel array, and then rendering the texture. 

## Fonts

The CHIP-8 memory has fifteen preloaded sprites, which are representations of the hexadecimal digits 0-F. Each one is 4 x 5 pixels, so we can represent each as 5 bytes as such:
| Sprite    | Values |
| -------- | ------- |
| 0  | `0x` `0x` `0x` `0x` `0x` |
| 1 | `0x` `0x` `0x` `0x` `0x` |
| 2    | `0x` `0x` `0x` `0x` `0x` |
| 3  | `0x` `0x` `0x` `0x` `0x` |
| 4 | `0x` `0x` `0x` `0x` `0x` |
| 5    | `0x` `0x` `0x` `0x` `0x` |
| 6  | `0x` `0x` `0x` `0x` `0x` |
| 7 | `0x` `0x` `0x` `0x` `0x` |
| 8    | `0x` `0x` `0x` `0x` `0x` |
| 9  | `0x` `0x` `0x` `0x` `0x` |
| A | `0x` `0x` `0x` `0x` `0x` |
| B    | `0x` `0x` `0x` `0x` `0x` |
| C  | `0x` `0x` `0x` `0x` `0x` |
| D | `0x` `0x` `0x` `0x` `0x` |
| E    | `0x` `0x` `0x` `0x` `0x` |
| F    | `0x` `0x` `0x` `0x` `0x` |

You should probably have a static array in your emulator so that you can quickly preload them into the system's memory at runtime.

# Setup

Alright, we're almost ready to do some programming, but first we need to decide what tools we're going to use. In other words, we need to choose a programming language and graphics library. If you're up for the challenge, I recommend trying something new - I usually try to do each new project in a new programming language. For this tutorial, I'm trying to provide a complete guide, so I'll be detailing code and guidance in six languages: C++, Python, Java, OCaml, Swift, and Rust. If you're not an experienced programmer, I suggest you start in Python, as it'll probably have the lowest learning curve.

## Folder Structure, Graphics, and Implementation

There's a number of graphics libraries you can use to render your emulator, but I recommend using [SDL](https://www.libsdl.org/) if you're developing for Windows and use [SpriteKit](https://developer.apple.com/spritekit/) if you're developing for macOS/iOS. Although SDL is a C library, there are bindings for tons of languages out there. I encourage you to determine what folder and file structure works best for you by yourself, as it'll also help you think about abstractions you can make in your code.

## The Main Loop



## The CPU Class and its Members

Okay, let's now get into actually building our emulator. As I dicussed in the Specifications section, there are several components of the system that we have to recreate; since the CHIP-8 structure is very simple, it suffices to keep everything as variables in a `CPU` class. We'll need more abstraction and encapsulation for more complicated emulators later. The variables we'll create are:
- Memory: We need 4KB of RAM, which can be a regular array.
- Program Counter (`PC`): This can be a single byte, pointing to wherever the next instruction needs to be read from.
- Index Register (`I`): This is a 16-bit (2 byte) value, but since there only 4KB of RAM, it'll only ever have a maximum of 4095, which happens to be the maximum 12-bit unsigned decimal value.
- Stack: The CHIP-8 specification needs to support up to 12 subroutine calls, but unless you're somehow reading this half a century before it was written, that's never going to be an issue on modern computers. There are a few ways to go about implementing this, but we're going to have it as an array of 16-bit numbers along with a 16-bit variable called the **stack pointer** that will keep track of where we are in the array.
- Delay Timer: 8-bit value that decreases from its maximum of `0xFF` to `0x00` at a rate of 60 times per second (once we get the timing right).
- Sound Timer: 8-bit value that controls the single beeping sound supported by CHIP-8, which is emitted whenever the sound timer is `0x02` or higher, and counts down like the Delay Timer.
- Registers: These are 8-bit general-purpose registers that do the actual heavy lifting of the computation. They are labeled `V0` through `VF` (15 in hexadecimal), so we can emulate them using a one byte array of length 16.
- Display: The display for the CHIP-8 is monochrome and is 64 x 32 pixels, which means that every pixel is either `0x00` or `0x01`. We can represent this as a 1-dimensional array. It would make sense for this to be in the `Emulator` class rather than the `CPU` class, but we'll need to modify it using instructions, so this makes life a little easier.

## The Instruction Set

All the setup is finally done, and we're ready to actually create the logic behind the emulator. As you know, the CHIP-8 ROMs are being read in as bytes, and each instruction is 2 bytes long. Each instruction does specific tasks with the registers, display, or program counter, so one way to write that functionality is to have a `switch` statement (or your language's equivalent) that decodes the instruction and executes the relevant code. Another, fancier way is to use function pointers with some logic like this:

```c++
/* Fetch opcode */
instruction = memory[pc] << 8 | memory[pc + 1];

/* Find the right spot in the table */
void(CHIP8:: * opcode_fn)() = Chip8Table[(instruction & 0xF000) >> 12];

/* Execute the relevant function */
(this->*opcode_fn)();
```

But this is not necessary at all, and might be slower than a simple `switch`. Let's now go through each of the 35 instructions supported by CHIP-8 and see how we can write them. The [CHIP-8 Technical Reference](https://github.com/mattmikolay/chip-8/wiki/CHIP%E2%80%908-Technical-Reference) GitHub wiki by Matthew Mikolay has all the instructions with descriptions. That repository also has a lot more technical information about the CHIP-8 interpreter than I have provided here, so check it out if there's something you think is missing.

For our switch statement, we'll match the cases with `instruction & 0xF000`, which will let us match the most significant digit for the instructions that have `N` in them.

### `0NNN`

Good news! We don't need to implement this one, since it was designed to execute subroutines on the 1802 microprocessor.

### `00E0` and `00EE` 

`00E0` clears the screen, making all the pixels zero. We can do this in a single line.
`00EE` returns from a subroutine. Remember that we use the the stack to keep track of subroutine calls, so returning from one means decreasing the stack pointer. We'll see how to call a subroutine in a second.

```python
case 0x0000:
    if instruction == 0x00E0:
        # 0E00: Clear the screen. Set all pixels to 0
        self.screen = [0] * 0x800
    elif instruction == 0x00EE:
        # 00EE: Return from a subroutine. Set the program counter to the address at the top of the stack
        self.stack_pointer -= 1
        self.program_counter = self.stack[self.stack_pointer]
```

### `1NNN`

```python
case 0x1000:
    # 1NNN: Jump to address NNN
    self.program_counter = instruction & 0x0FFF
```

### `2NNN`

```python
case 0x2000:
    # 2NNN: Call subroutine at NNN. We place the current program counter on the stack so we can return to it later when returning from the subroutine
    self.stack[self.stack_pointer] = self.program_counter
    self.stack_pointer += 1
    self.program_counter = instruction & 0x0FFF
```

### `3XNN`

```python
case 0x3000:
    # 3XNN: Skip the next instruction if register X equals NN
    if self.registers[(instruction & 0x0F00) >> 8] == instruction & 0x00FF:
        self.program_counter += 2
```

### `4XNN`

```python
case 0x4000:
    # 4XNN: Skip the next instruction if register X does not equal NN
    if self.registers[(instruction & 0x0F00) >> 8] != instruction & 0x00FF:
        self.program_counter += 2
```

### `5XY0`

```python
case 0x5000:
    # 5XY0: Skip the next instruction if register X equals register Y
    if self.registers[(instruction & 0x0F00) >> 8] == self.registers[(instruction & 0x00F0) >> 4]:
        self.program_counter += 2
```

### `6XNN`

```python
case 0x6000:
    # 6XNN: Set register X to NN
    self.registers[(instruction & 0x0F00) >> 8] = instruction & 0x00FF
```

### `7XNN`

```python
case 0x7000:
    # 7XNN: Add NN to register X
    self.registers[(instruction & 0x0F00) >> 8] += instruction & 0x00FF
```

### `8XY0` - `8XY7` and `8XYE`

These 

```python
```

### `9XY0`

```python
```

### `ANNN`

```python
```

### `BNNN`

```python
```

### `CXNN`

```python
```

### `DXYN`

```python
```

### `EX9E`

```python
```

### `EXA1`

```python
```

### `FX07`

```python
```

### `FX0A`

```python
```

### `FX15`

```python
```

### `FX18`

```python
```

### `FX1E`

```python
```

### `FX29`

```python
```

### `FX33`

```python
```

### `FX55`

```python
```

### `FX65`

```python
```

# Concluding Remarks