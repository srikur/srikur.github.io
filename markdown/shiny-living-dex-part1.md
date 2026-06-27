---
title: "A Shiny Living Dex for Gen I-IV in 2026"
date: 2026-06-04
slug: shiny-living-dex
---

*NOTE: In progress. Will update this as I catch more shinies*

# A Shiny Living Dex for Gen I-IV in 2026: Part I -- 1-151

I'm somewhat of a Pokemon boomer. It is my belief that the only "real" Pokemon are those numbered 1-493 in the Pokedex -- i.e., Generations I-IV, spanning from the original games to HeartGold and SoulSilver, released in 2010. A few years ago, I completed a goal of mine I had since I was a kid: to catch every single Pokemon in Emerald (1-386) and have a living dex of them. Now, I want to take it a couple of steps further; I want to catch every single Pokemon from Gen I-IV, and I want them all to be shiny. If you're wondering how we're going to do this without cheating, well, we'll be flirting with the line a bit, but we won't do anything that constitutes cheating in my mind. Some of the rules we'll be following:

- No cheat codes using devices like the Action Replay or GameShark.
- No cloning or trading with clones.
- Simulating events that have already happened in the past, in order to obtain event Pokemon that are no longer obtainable in the present day.
- Incorporating the use of emulators at unthrottled speed and scripts to automate the process of finding shinies. This is the one I think most people will have a problem with, given that part of the allure of shinies is the effort that goes into manually resetting games until you find one. Unfortunately, I don't think I can dedicate the many years of my life it would take to do this on real hardware, nor would I ever have the patience and discipline to do so.

The process of finding shinies is already a game of chance, and using an emulator and scripts just speeds up that process. It's not like we're hacking the game or doing anything that would give us an unfair advantage. We're just using tools to make the process more efficient. If you don't like it -- oh well.

In order to facilitate the process, I'll be using emulators that allow for scripting in Lua and developing the scripts as we go. All the scripts are available in a public GitHub repo: [Pkmn Shiny Hunting Scripts](https://www.github.com/srikur/pkmn-shiny-hunting-scripts/). The scripts should be compatible with any emulator that supports Lua scripting; I'll be using mGBA. They're also intended for the US versions of the games, but they should be easily adaptable to other localizations if you wish to use them. As you'll see later in the article, one exception is that we'll be using 

I'm planning on doing this one generation at a time, starting with Gen I with FireRed and LeafGreen. While we could do it with the original Red and Blue, and then transfer the Pokemon over to Gen II to realize their shinyness, and then use unofficial methods to transfer the GBC save file Pokemon over to the GBA games, that's more of a hassle than I'd like to do right now, so we're going to starting with FRLG for 1-151, moving to RSE for the Hoenn dex, and then Emerald for the rest of the National dex up to 386. After that, we'll move over to Diamond, Pearl, and Platinum for the start of Gen IV, and finish up with HeartGold and SoulSilver.

Since the GBA games cover generations I and III, I plan on collecting the first 151, then moving over to Hoenn, to get 252-386, then going to HGSS to fill out Gen II. The primary benefit I see to doing things this way, given that I eventually want to have the completed shiny living dex in my physical HeartGold copy, is that I can save a lot of effort 

Let's get started!


## Part I -- The Starters (1-9): 

For the starters, we'll be using [this script](https://github.com/srikur/pkmn-shiny-hunting-scripts/blob/main/frlg/frlg_shiny_starters.lua), which automates the process of selecting the starter in front of the player, calculating its shinyness, and resetting the save state if it's not. Pretty simple idea. The caveat is that we need to do this 3 times for each starter, since we're building a shiny living dex. This'll come up again for basically any Pokemon that has an evolution line. I thought I would be able to run multiple mGBA instances, with each one having its own script running, but it doesn't seem to be easily possible -- or at least I couldn't figure it out.

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

## Part II -- From Pallet Town to Celadon City

Our first non-starter hunt will be for Pidgey and Rattata, the two Pokemon that can be found on Route 1 right after you leave Pallet Town. Unfortunately we actually need to catch 5 -- 3 Pidgeys (Pidgey, Pidgeotto, Pidgeot), and 2 Rattatas (Rattata and Raticate). For this, we'll be using a different Lua script I created, which is intended for automated searching in the grass or any open space where encounters can be had, like surfing or in a cave.

[Here's](https://github.com/srikur/pkmn-shiny-hunting-scripts/blob/main/frlg/frlg_grass_hunting.lua) a link to that script; it allows for setting a target pokemon and ignoring any other shinies that appear which are not that target. Leave the target species variable as `nil` and the allow other shinies variable as `true` to ensure that is turned off.

![Shiny Pidgey in the Wild](/images/shiny-frlg/shiny_pidgey_in_wild.png)

About 60,000 encounters later, we have 5 new shiny specimens! Time to move on to the next route that we have access to, Route 22. This route, west of Viridian City, has grassy areas with wild Rattata, Spearow, and Mankey. We'll need to catch two Spearows (Spearow and Fearow) and two Mankeys (Mankey and Primeape). The good news is that while doing this, I finally figured out how to have multiple mGBA instances running scripts at unthrottled speed at the same time, so I was able to spin up 4 at once. However, I was traveling while doing this section, so I only had a MacBook Air to work with. Later on, I plan on having my much beefier desktop running at an even higher unthrottled speed.

![Four mGBAs running at once](/images/shiny-frlg/four_mgbas.png)

No matter, as after 9731 encounters on one of the instances, I found a shiny Mankey! Quarter of the way there. A few thousand parallelized encounters and an extraneous shiny Rattata later, a shiny Spearow. After catching the Spearow, I realized I would need to pause the hunt for a bit to progress through the game and get some money, as I had run out of Pokeballs.

After catching several more shinies and making my way to Mt. Moon, I decided that to play ahead in the game to get access to Fly and the fourth gym badge, so that I could go back to older routes more easily. It's worth noting that the fossil you choose in Mt. Moon does not have its shinyness calculated until you revive the fossil on Cinnabar Island, so there's no need to worry about that now.

![Charmeleon Evolution](/images/shiny-frlg/charmeleon.png)



## Part III -- In-Game Static Interactions

Now 

## Part IV -- The Lucky Egg

## Part V -- Taking Stock

## Part VI -- Version Exclusives

## Part VII -- Eggs

## Part VIII -- Fishing

## Part IX -- The Completed Kanto Pokedex


