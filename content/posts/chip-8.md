---
title: 'How to: Write a Basic CHIP-8 Emulator'
date: 2024-07-25
draft: false
---

NOTE: Unfinished

# Introduction

If you've ever played console games on your phone or laptop, you're familiar with what an emulator is. They're called that because they *emulate* the functionality of that computer architecture on another system. Emulation means that we're making the host system *behave* like the guest system, so that we can run software designed for the guest system, like games, on the host. If building your own versions of those sound exciting to you, then this project will help you get a good glimpse of what's necessary to develop an emulator in a somewhat contrived scenario.

Our road to becoming qualififed emulator developers begins with the CHIP-8. In the 1970s, Joseph Weisbecker developed CHIP-8 as an interpreted programming language for use on a couple of 8-bit microcomputers. We're starting our emulator development journey by building the CHIP-8 virtual machine since it will introduce the concepts needed for the more compicated systems, while still being a short project---it's very feasible to get it running on day one if you dedicate some focused hours to it.

In this tutorial we're going to be writing the emulator in Python, mainly for ease of syntax. What that means, though, is what we're not going to worry about performance that much. Most emulators for more modern, powerful consoles are written in C, C++, or another language that gives much more control over memory. We'll also be ignoring the bells and whistles that come with developing finished products, like a nice GUI; rather, we'll focus implementing the instruction set and the core concepts behind it. That said, if there's a language you would like to learn but don't yet have much experience with, I strongly recommend using that instead.

To condense the plan into one sentence, our goal is to emulate the functionality of a game system programmatically by having an endless loop where we fetch low level instructions from ROMs (i.e. game cartridge binary dumps), execute those instructions, and repeat, updating the screen graphics as necessary. This is basically what the real consoles' CPUs are doing at the hardware level.

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
| 0  | `0xF0` `0x90` `0x90` `0x90` `0xF0` |
| 1 | `0x20` `0x60` `0x20` `0x20` `0x70` |
| 2    | `0xF0` `0x10` `0xF0` `0x80` `0xF0` |
| 3  | `0xF0` `0x10` `0xF0` `0x10` `0xF0` |
| 4 | `0x90` `0x90` `0xF0` `0x10` `0x10` |
| 5    | `0xF0` `0x80` `0xF0` `0x10` `0xF0` |
| 6  | `0xF0` `0x80` `0xF0` `0x90` `0xF0` |
| 7 | `0xF0` `0x10` `0x20` `0x40` `0x40` |
| 8    | `0xF0` `0x90` `0xF0` `0x90` `0xF0` |
| 9  | `0xF0` `0x90` `0xF0` `0x10` `0xF0` |
| A | `0xF0` `0x90` `0xF0` `0x90` `0x90` |
| B    | `0xE0` `0x90` `0xE0` `0x90` `0xE0` |
| C  | `0xF0` `0x80` `0x80` `0x80` `0xF0` |
| D | `0xE0` `0x90` `0x90` `0x90` `0xE0` |
| E    | `0xF0` `0x80` `0xF0` `0x80` `0xF0` |
| F    | `0xF0` `0x80` `0xF0` `0x80` `0x80` |

You should probably have a static array in your emulator so that you can quickly preload them into the system's memory at runtime.

# Setup

Alright, we're almost ready to do some programming, but first we need to decide what tools we're going to use. In other words, we need to choose a programming language and graphics library. If you're up for the challenge, I recommend trying something new - I usually try to do each new project in a new programming language. For this tutorial, I'm trying to provide a complete guide, so I'll be detailing code and guidance in four languages: C++, Python, Java,and Swift. If you're not an experienced programmer, I suggest you start in Python, as it'll probably have the lowest learning curve.

## Folder Structure, Graphics, and Implementation

There's a number of graphics libraries you can use to render your emulator, but I recommend using [SDL](https://www.libsdl.org/) if you're developing for Windows and use [SpriteKit](https://developer.apple.com/spritekit/) if you're developing for macOS/iOS. Although SDL is a C library, there are bindings for tons of languages out there. I encourage you to determine what folder and file structure works best for you by yourself, as it'll also help you think about abstractions you can make in your code.

## The Main Loop

In order to read instructions from ROMs sequentially, we need to have a loop that runs endlessly -- or at least until we tell the program to quit in some way. All you need is a simple loop that will execute the CPU of our emulator (at a specific frame rate), polling keyboard events and drawing updates to the screen if necessary along the way. The basic skeleton looks something like this:

```python
while not self.quit:
    # Poll Events

    # Emulate CPU cycle(s)

    # Render the screen
```

Here, `self.quit` is just a boolean flag for whether or not we should exit the loop and run the cleanup code before ending the program altogether.

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

Here's the CPU class definitions. You can ignore any of the variables I haven't explained yet for now. I'll cover them when we get to where they're actually used. 

## Starting Out

The section after this has descriptions and code for the complete instruction set, but rather than try to do them all in one go, you should start off with the following five: 
- `00E0` (clearing the screen)
- `1NNN` (jumping to address `NNN`)
- `6XNN` (set register `X` to value `NN`)
- `ANNN` (set index register to value `NNN`)
- `DXYN` (draw a sprite at (`X`,`Y`))

These five are used in Timendus' CHIP-8 splash screen logo test ROM. You can find that one along with a bunch of other test ROMs [here](https://github.com/Timendus/chip8-test-suite). As noted in that GitHub repo, the original IBM test logo requires an additional instruction, `7XNN`. After those two work properly, you can start using the test ROMs that test a lot more functionality.

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

This instruction "jumps" to value located at the memory location `NNN`. Remember, the logical `AND` will return 0 if either of the bits being compared is zero. What we're doing here is using the value `0x0FFF` to *mask* the lower 12 bits of the instruction's value. Since leading zeroes don't matter in binary, this leaves with just `NNN`. Also note that the only thing we need to do to make this jump is set the program counter, since that is what loads the subsequent instruction to be executed.

```python
case 0x1000:
    # 1NNN: Jump to address NNN
    self.program_counter = instruction & 0x0FFF
```

### `2NNN`

Like the previous `1NNN`, this instruction sets the PC to the lower 12 bits of the instruction. However, since its purpose is to call a subroutine, we need to push the pre-call instruction location onto the stack. This will allow us to *pop* the value off the stack when its time to return from the subroutine. You don't really need to worry about the stack pointer overflowing if you've correctly implement all the instructions. In fact, if your program crashes due to trying to access an index beyond the size of the stack, you'll know that either this instruction or some other one is incorrect.

```python
case 0x2000:
    # 2NNN: Call subroutine at NNN. We place the current program counter on the stack so we can return to it later when returning from the subroutine
    self.stack[self.stack_pointer] = self.program_counter
    self.stack_pointer += 1
    self.program_counter = instruction & 0x0FFF
```

### `3XNN`

`3XNN` is the first instruction that's a little different. It skips the next instruction if `X` does not equal `NN`. Let's break down both sides of the `if` statement, since their structure will come up in practically every instruction from here on out. 

On the left hand side we have `self.registers[(instruction & 0x0F00) >> 8]`. Here what we're doing is using a bitmask `AND` to get the second nibble from the instruction, giving us `X00`. Then we right shift it by 8 bits -- what this does is essentially discard the lowest two nibbles of `X00` and gets it to just `X` (remember the leading zeroes don't count, only the trailing ones do). Now, we can index the registers array, since we want to compare the value of register `X` to `NN`.

As you now know, to do that we take `instruction & 0x00FF`, which gives us just the lower byte of the instruction, and compare it to the left hand side. Since we increment the program counter by 2 in the fetch-decode-execute loop, skipping an instruction involves adding another 2 to the PC.

```python
case 0x3000:
    # 3XNN: Skip the next instruction if register X equals NN
    if self.registers[(instruction & 0x0F00) >> 8] == instruction & 0x00FF:
        self.program_counter += 2
```

### `4XNN`

This is pretty much the same as the previous instruction, but remember to use `!=` instead of `==`.

```python
case 0x4000:
    # 4XNN: Skip the next instruction if register X does not equal NN
    if self.registers[(instruction & 0x0F00) >> 8] != instruction & 0x00FF:
        self.program_counter += 2
```

### `5XY0`

Like the previous two instructions, we are adding additional amounts to the PC if a certain condition is met. However, this time we're comparing the values of two registers. Register `X` we obtain like before, by using a bitmask and then shifting the value 8 bits to the right. For register `Y`, we do the same, but using `0x00F0` and shifting right by 4 bits instead, as the location of `Y` in the instruction is one nibble to the right.

```python
case 0x5000:
    # 5XY0: Skip the next instruction if register X equals register Y
    if self.registers[(instruction & 0x0F00) >> 8] == self.registers[(instruction & 0x00F0) >> 4]:
        self.program_counter += 2
```

### `6XNN`

You should have no problem interpreting this one now. We are simply setting the value of the register at `X` to be `NN`, extracting those two values in the standard way.

```python
case 0x6000:
    # 6XNN: Set register X to NN
    self.registers[(instruction & 0x0F00) >> 8] = instruction & 0x00FF
```

### `7XNN`

The same as `6XNN`, but we are adding the value of `NN` to the previous value contained in register `X`.

```python
case 0x7000:
    # 7XNN: Add NN to register X
    self.registers[(instruction & 0x0F00) >> 8] += instruction & 0x00FF
```

### `8XY0` - `8XY7` and `8XYE`

These are some arithmetic instructions. Note that in the Python code for some of the intermediate calculations, we need to include `& 0xFF` before using them. The reason is because we're simulating 8-bit or 16-bit unsigned integers using the regular signed integer datatype that Python has, so we run the risk of not properly overflowing those integer values as they would in a regular 8-bit unsigned value. To fix that, we simply take the lowest byte of the integer before doing any further calculations with a value. If you're using a language that has built in unsigned bytes, like `uint8_t` in C/C++, you don't need to worry about that.

```python
case 0x8000:
    match instruction & 0x000F:
        case 0x0000:
            # 8XY0: Set register X to the value of register Y
            self.registers[(instruction & 0x0F00) >> 8] = self.registers[(instruction & 0x00F0) >> 4]
        case 0x0001:
            # 8XY1: Set register X to the value of register X OR register Y
            self.registers[(instruction & 0x0F00) >> 8] |= (self.registers[(instruction & 0x00F0) >> 4])
        case 0x0002:
            # 8XY2: Set register X to the value of register X AND register Y
            self.registers[(instruction & 0x0F00) >> 8] &= (self.registers[(instruction & 0x00F0) >> 4])
        case 0x0003:
            # 8XY3: Set register X to the value of register X XOR register Y
            self.registers[(instruction & 0x0F00) >> 8] ^= (self.registers[(instruction & 0x00F0) >> 4])
        case 0x0004:
            # 8XY4: Add the value of register Y to register X. Set VF to 1 if there is a carry, 0 otherwise
            self.registers[(instruction & 0x0F00) >> 8] = (self.registers[(instruction & 0x0F00) >> 8] & 0xFF) \
                                                        + (self.registers[(instruction & 0x00F0) >> 4] & 0xFF)
            if self.registers[(instruction & 0x0F00) >> 8] > 0xFF:
                self.registers[0xF] = 1
            else:
                self.registers[0xF] = 0
            self.registers[(instruction & 0x0F00) >> 8] &= 0xFF
        case 0x0005:
            # 8XY5: Subtract the value of register Y from register X. Set VF to 0 if there is a borrow, 1 otherwise
            self.registers[(instruction & 0x0F00) >> 8] = (self.registers[(instruction & 0x0F00) >> 8] & 0xFF) \
                                                        - (self.registers[(instruction & 0x00F0) >> 4] & 0xFF)
            if self.registers[(instruction & 0x0F00) >> 8] < 0:
                self.registers[0xF] = 0
            else:
                self.registers[0xF] = 1
            self.registers[(instruction & 0x0F00) >> 8] &= 0xFF
        case 0x0006:
            # 8XY6: Shift the value of register X right by 1. Set VF to the least significant bit of X before the shift
            last_bit = self.registers[(instruction & 0x0F00) >> 8] & 0xFF & 0x01
            if self.shift_quirk:
                self.registers[(instruction & 0x0F00) >> 8] >>= 1
            else:
                self.registers[(instruction & 0x0F00) >> 8] = (self.registers[(instruction & 0x00F0) >> 4] & 0xFF) >> 1
            self.registers[0xF] = last_bit
        case 0x0007:
            # 8XY7: Set register X to the value of register Y minus register X. Set VF to 0 if there is a borrow, 1 otherwise
            self.registers[(instruction & 0x0F00) >> 8] = (self.registers[(instruction & 0x00F0) >> 4] & 0xFF) \
                                                        - (self.registers[(instruction & 0x0F00) >> 8] & 0xFF)
            if self.registers[(instruction & 0x0F00) >> 8] < 0:
                self.registers[0xF] = 0
            else:
                self.registers[0xF] = 1
            self.registers[(instruction & 0x0F00) >> 8] &= 0xFF
        case 0x000E:
            # 8XYE: Shift the value of register X left by 1. Set VF to the most significant bit of X before the shift
            first_bit = (self.registers[(instruction & 0x0F00) >> 8] & 0x80) >> 7
            if self.shift_quirk:
                self.registers[(instruction & 0x0F00) >> 8] = ((self.registers[(instruction & 0x0F00) >> 8] & 0xFF) << 1) & 0xFF
            else:
                self.registers[(instruction & 0x0F00) >> 8] = ((self.registers[(instruction & 0x00F0) >> 4] & 0xFF) << 1) & 0xFF
            self.registers[0xF] = first_bit
```

The next few instructions are pretty self-explanatory and use the same ideas we've already seen.

### `9XY0`

```python
case 0x9000:
    # 9XY0: Skip the next instruction if register X does not equal register Y
    if self.registers[(instruction & 0x0F00) >> 8] != self.registers[(instruction & 0x00F0) >> 4]:
        self.program_counter += 2
```

### `ANNN`

```python
case 0xA000:
    # ANNN: Set the index register to the address NNN
    self.index_register = instruction & 0x0FFF
```

### `BNNN`

```python
case 0xB000:
    # BNNN: Jump to the address NNN plus the value of register 0
    self.program_counter = (instruction & 0x0FFF) + self.registers[0]
```

### `CXNN`

```python
case 0xC000:
    # CXNN: Set register X to a random number AND NN
    random.seed()
    self.registers[(instruction & 0x0F00) >> 8] = random.randint(0, 255) & (instruction & 0x00FF)
```

Alright, here is the instruction that actually draws to the screen, and it's by far the most complicated instruction to implement. Getting this to run properly will also allow you to start using test ROMs, so you can check if you've handled all the quirks of the system properly.

What `DXYN` does is draw a sprite at the point with x-coordinate determined by the value of register `X`, and y-coordinate determined by the value of register `Y`. To do so, we use `N` bytes of sprite data from the location pointed to by the index pointer.

### `DXYN`

```python
case 0xD000:
    # DXYN: Draw a sprite at coordinate VX, VY using N bytes of sprite data starting at the address stored in the index register
    # If any set pixels are unset, set VF to 1. Otherwise, set VF to 0
    self.registers[0xF] = 0
    x = self.registers[(instruction & 0x0F00) >> 8]
    y = self.registers[(instruction & 0x00F0) >> 4]
    for i in range(instruction & 0x000F):
        sprite_byte = self.memory[self.index_register + i]
        for j in range(8):
            pixel = (sprite_byte & (0x80 >> j)) >> (7 - j)
            if pixel == 1:
                if self.screen[(x + j + ((y + i) * self.screen_width)) % len(self.screen)] == 1:
                    self.registers[0xF] = 1
                self.screen[(x + j + ((y + i) * self.screen_width)) % len(self.screen)] ^= 1
    self.draw_flag = True
```

For these two instructions, we access the `keys` array that holds whether any of the 16 keys have been pressed in this frame. You should check (i.e. poll) these events every frame in your main program loop.

### `EX9E` and `EXA1`

```python
case 0xE000:
    match instruction & 0x00FF:
        case 0x009E:
            # EX9E: Skip the next instruction if the key stored in register X is pressed
            if self.keys[self.registers[(instruction & 0x0F00) >> 8]] != 0:
                self.program_counter += 2
        case 0x00A1:
            # EXA1: Skip the next instruction if the key stored in register X is not pressed
            if self.keys[self.registers[(instruction & 0x0F00) >> 8]] == 0:
                self.program_counter += 2
```

### `FX07` - `FX65`

These are a bunch of miscellaneous instructions. Make sure you remember to mask values (i.e. `& 0xFFFF` or `& 0xFF`) anywhere where there could be a value that goes above either 16-bits or 8-bits, respectively.

```python
case 0xF000:
    match instruction & 0x00FF:
        case 0x0007:
            # FX07: Set register X to the value of the delay timer
            self.registers[(instruction & 0x0F00) >> 8] = self.delay_timer
        case 0x000A:
            # FX0A: Wait for a key press and store the result in register X
            key_pressed = False
            for i in range(16):
                if self.keys[i] != 0:
                    self.registers[(instruction & 0x0F00) >> 8] = i
                    key_pressed = True
                    break
            if not key_pressed:
                self.program_counter -= 2
        case 0x0015:
            # FX15: Set the delay timer to the value of register X
            self.delay_timer = self.registers[(instruction & 0x0F00) >> 8] & 0xFF
        case 0x0018:
            # FX18: Set the sound timer to the value of register X
            self.sound_timer = self.registers[(instruction & 0x0F00) >> 8] & 0xFF
        case 0x001E:
            # FX1E: Add the value of register X to the index register
            self.index_register = ((self.index_register & 0xFFF) + self.registers[(instruction & 0x0F00) >> 8]) & 0xFFFF
        case 0x0029:
            # FX29: Set the index register to the location of the sprite for the character in register X
            self.index_register = self.registers[(instruction & 0x0F00) >> 8] * 5
        case 0x0033:
            # FX33: Store the binary-coded decimal representation of the value of register X at the addresses I, I+1, and I+2
            self.memory[self.index_register] = self.registers[(instruction & 0x0F00) >> 8] // 100
            self.memory[self.index_register + 1] = (self.registers[(instruction & 0x0F00) >> 8] // 10) % 10
            self.memory[self.index_register + 2] = self.registers[(instruction & 0x0F00) >> 8] % 10
        case 0x0055:
            # FX55: Store the values of registers V0 to VX in memory starting at address I
            for i in range(((instruction & 0x0F00) >> 8) + 1):
                self.memory[(self.index_register + i) & 0xFFFF] = self.registers[i]
            self.index_register = (self.index_register & 0xFFFF) + ((((instruction & 0x0F00) >> 8) + 1) & 0xFFFF) & 0xFFFF
        case 0x0065:
            # FX65: Fill registers V0 to VX with values from memory starting at address I
            for i in range(((instruction & 0x0F00) >> 8) + 1):
                self.registers[i] = self.memory[self.index_register + i] & 0xFF
            self.index_register = (self.index_register & 0xFFFF) + ((((instruction & 0x0F00) >> 8) + 1) & 0xFFFF) & 0xFFFF
```

## SUPER-CHIP Additions

The SUPER-CHIP, an extension of the original CHIP-8, introduced several new features and instructions. Here are some of the key additions:

1. Higher Resolution: SUPER-CHIP added a high-resolution mode of 128x64 pixels, in addition to the original 64x32 mode.

2. Scrolling: New instructions were added to scroll the display in different directions.

3. Extended Sprite Drawing: SUPER-CHIP allowed for 16x16 pixel sprites in addition to the original 8x8 sprites.

4. New Instructions:
   - 00CN: Scroll display N pixels down
   - 00FB: Scroll display 4 pixels right
   - 00FC: Scroll display 4 pixels left
   - 00FD: Exit CHIP-8 interpreter
   - 00FE: Disable high-resolution mode
   - 00FF: Enable high-resolution mode
   - DXY0: Draw 16x16 sprite
   - FX75: Store V0..VX in RPL user flags (X <= 7)
   - FX85: Read V0..VX from RPL user flags (X <= 7)

These additions expanded the capabilities of CHIP-8, allowing for more complex graphics and interactions in SUPER-CHIP programs.


## XO-CHIP Additions

# Concluding Remarks

