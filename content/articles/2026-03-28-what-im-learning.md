---
title: "Phaser 3 and Making AI Do My Work"
date: 2026-03-28
tags:
  - learning
references:
  - title: "TileNamer"
    url: "https://tilenamer.bunly.net/"
  - title: "Phaser 3 Docs"
    url: "https://newdocs.phaser.io/"
---

A short note on what's on my mind at the moment.

Lately I've been diving into Phaser 3 for this very website, and picking up bits of pixel art here and there. I created another website called TileNamer. It helps you name components of pixel art assets with legible names so it's easier to integrate them into your code. For example, I really struggled with the pixel art building walls and door because the AI couldn't parse the image to quickly build it for me.

I reflected on it and wondered if it was my prompt-engineering skills, but ultimately AI image-processing technology for something as niche as pixel art assets simply hasn't caught up to the other capabilities of artificial intelligence. Maybe I'll build my own LLM for it... Maybe not. I'll see what whil I'm feeling.

Anyway, I made TileNamer to assign names to different parts of pixel art assets. The names are stored in JSON or TypeScript, making them easy to export via download or copy/paste. Why is this useful? If you're coding by-hand and need to add a door asset at coordinate (x,y), it's easier to write FurnitureTileMap.Door than to search through which 16x16 coordinate it belongs to and manually write it in. Can you imagine trying to remember all the coordinates?

Now, I'm sure there's an easier way to build things - I'm aware of tools such as Tiled to help developers easily build maps. But I'm a fan of making AI do things for me. So it's much easier to say "Build me a 10x10 house using the WoodenHouse tilemap. I want a double door and lots of floral decorations", than to actually build it myself.

I really lived up to my title of an engineer. I spent 2 hours optimising something I could have done in maybe 15 minutes. But for every house or garden I build in my personal website, all I have to do is take out my whip (keyboard) and let the little robot do it's thing (affectionately).

Anyway, all this yabber is because I want to write more about the specific things I learn as I go — not polished tutorials, just notes to my future self (and anyone who stumbles in here).

Until next time.
Hannah.
