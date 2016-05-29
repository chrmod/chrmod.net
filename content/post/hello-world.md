+++
date = "2016-05-29T18:13:33+02:00"
title = "hello world"

+++

Will try to go fast with this one as it's my first blog post ever.

# Hello World!

Guess that's the phrase, that most developers use when they start a new project, right?

## Yet another dev blog

Yes, chrmod.net is going to be yet another blog by some kind of developer. You can expect to find here code/configuration snippets, tips for my favorite tools, or solutions to tech problems that I found surprising.

I really wanted to start writing for quite some time now, but you know how it is, beginnings are hard. But finally something has changed.

## Trigger

It was a very simple thing that I wanted to do (it often starts like that) - to post a picture online, so other people can see how my linux destkop environment looks like atm. Easy you would think, well, sure it is simple for some, not for me.. I've got an image, a place to post it ([unixporn](https://www.reddit.com/r/unixporn) subreddit), and there was only one problem, reddit is not hosting images - it wants an URL.

OK. There are many free image hosting, most people on unixporn use imgur.com, but that would be too easy.
Instead I decided to finally kick off own website in a form of a blog. After 24 hours, here we are.

## Technology

This would not be a tech blog if I wouldn't explain what, how and why I did it.

### Requirements

First of all, I didn't really want to pay for anything (at least not in the beginning). chrmod.net is suppose to be a blog for sharing stuff, not earning money.

Second, with traditional approach (which I assume is wordpress + mysql + apache, etc), there is so much stuff to care about and to maintain.

Third, I do like to write code and tend to avoid CMSs as much as possible.

### Solution

The obvious way to go was to use some kind of static page generator and host it on github as apparently we're able to use for free for personal stuff (citing chastell on [this one](https://twitter.com/chastell/status/736926755999617024))

Also I really wanted to host my stuff over https. I knew there is letsencrypt, but to use it with github pages didn't look that easy or even possible.

Fortunately I found kludsec that not only provide a free CDN but they also issued SSL certificate from letsencrypt automatically! Amazing!

Summarizing the setup is:

* hosting: [github pages](https://pages.github.com/)
* CDN: [kludsec](https://kloudsec.com/)
* SSL: [letsencrypt](https://letsencrypt.org/)
* engine: [hugo](http://gohugo.io/)

## Ending note

Here is that damned screenshot which started all this mess:

{{< figure src="/hello-world/desktop-screenshot-2016-05-29.png" title="gruvbox theme for i3wm, vim and tmux" >}}

What is on it, is a topic for another post!

# Day 0 update

Just after publishing this blog post, I've tried to share the screenshot on unixporn. And.. no success here. Today I've learned that Reddit submitted URLs must come from a short list of approved domains (imgur.com is obviously on it). The whole reason that pushed me to start a blog was invalid.

At least I have website now!
