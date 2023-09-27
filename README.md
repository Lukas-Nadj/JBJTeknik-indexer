# JBJ Indexer
A simple Electron product overview with search and files.
this was a project i created for JBJTeknik, also my first electron app, of course powered by Svelte, and rollup.

## Setup

in the footer, in the same color as the background, is the app directory path. navigate there, and create a file called "varer.json". node/fs may not have permission to create/edit the file. 
Or it creates the file, but doesn't have permission to edit or save to it. so creating it yourself can fix the fatal error that might appear

## What it looks like

<div>
  <img src="image.png" height= 400\>
  <img src="image2.png" height= 400\>
</div>

## What can it do why was it built?
It has a simple and elegant UI, maybe not the best implemented search bar, a collapsible "saved products" etc. it has room for improvement, but it was essentially built over half a month to aid in writing invoices for products that they provided, and since electron is a chromium browser, it is simple to open files in a new window since chrome supports pdf, image and video previews.
