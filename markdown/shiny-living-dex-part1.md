---
title: "A Shiny Living Dex for Gen I-IV in 2026: Part I -- 1-151"
date: 2026-06-04
slug: shiny-living-dex-part1
---

*NOTE: In progress. Will update this as I catch more shinies*

# A Shiny Living Dex for Gen I-IV in 2026: Part I -- 1-151

I'm somewhat of a Pokemon boomer. It is my belief that the only "real" Pokemon are those numbered 1-493 in the Pokedex -- i.e., Generations I-IV, spanning from the original games to HeartGold and SoulSilver, released in 2010. A few years ago, I completed a goal of mine I had since I was a kid: to catch every single Pokemon in Emerald (1-386) and have a living dex of them. Now, I want to take it a couple of steps further. I want to catch every single Pokemon from Gen I-IV, and I want them all to be shiny. If you're wondering how we're going to do this without cheating, well, we'll be flirting with the line a bit, but we won't do anything that constitutes cheating in my mind. That means we'll be:

- No cheat codes using devices like the Action Replay or GameShark.
- No cloning or trading with clones.
- Simulating events that have already happened in the past, in order to obtain event Pokemon that are no longer obtainable in the present day.
- Incorporating the use of emulators and scripts to automate the process of finding shinies.

That last one is probably where most people would draw the line, but I don't see it as cheating. It's just a more efficient way to do something that is already possible in the games. The process of finding shinies is already a game of chance, and using an emulator and scripts just speeds up that process. It's not like we're hacking the game or doing anything that would give us an unfair advantage. We're just using tools to make the process more efficient. If you don't like it -- oh well.

In order to facilitate the process, I'll be using emulators that allow for scripting, so I'll link each script I use in the process, which are in a public GitHub repo: [Pkmn Shiny Hunting Scripts](https://www.github.com/srikur/pkmn-shiny-hunting-scripts/). The scripts should be compatible with any emulator that supports Lua scripting; I'll be using mGBA. They're also intended for the US versions of the games, but they should be easily adaptable to other localizations if you wish to use them.

I'm planning on doing this one generation at a time, starting with Gen I with FireRed and LeafGreen. While we could do it with the original Red and Blue, and then transfer the Pokemon over to Gen II to realize their shinyness, that's more of a hassle than I'd like to do right now, so we're going to starting with FRLG for 1-151, moving to RSE for the Hoenn dex, and then Emerald for the rest of the National dex up to 386. After that, we'll move over to Diamond, Pearl, and Platinum for Gen IV. Let's get started!


## Part I -- The Starters (1-9): 

For the starters, we'll be using [this script](https://github.com/srikur/pkmn-shiny-hunting-scripts/blob/main/frlg/frlg_shiny_starters.lua), which automates the process of selecting the starter in front of the player, calculating its shinyness, and resetting the save state if it's not. Pretty simple idea. The caveat is that we need to do this 3 times for each starter, since we're building a shiny living dex. This'll come up again for basically any Pokemon that has an evolution line. Although I didn't do it for the starters, I'll be running multiple mGBA instances at once to increase the likelihood that at least one of them will succeed.

Here's a table of the number of resets it took to get all of them:
| Starter      | First Shiny | Second Shiny | Third Shiny |
| ----------- | ----------- | ------------- | ----------- |
| Bulbasaur   | 6101        | 3469          | 34169       |
| Squirtle    | 6634        | 1042          | 4279        |
| Charmander  | 6021        | 4007          | 9222        |


That third Bulbasaur took quite the while! Here's all the starters in Box 1 after I traded them over to a single save:

<p align="center">
  <img src="/images/shiny-frlg/starters_in_box.png" width="50%"  alt="Starters in the PC"/>
  <img src="/images/shiny-frlg/squirtle_summary.png" width="50%"  alt="Shiny Squirtle Summary"/>
</p>

Now we're ready to move on to the fun part: catching shinies in the wild!

## Part II -- Route 1 (Pidgey and Rattata)


