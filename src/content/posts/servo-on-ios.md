---
title: "Porting the Servo browser engine to iOS in two evenings"
description: "Servo shipped 0.1.0 on crates.io. The EU made Apple allow custom browser engines. So I tried."
date: 2026-05-07
tags: ["browsers", "servo", "ios"]
readTime: "12 min read"
draft: false
excerpt: "Servo just shipped 0.1.0 on crates.io. The EU just made Apple let us ship our own engines on iOS. I had two evenings free."
hnUrl: "https://news.ycombinator.com/submit"
---

Last week the Servo project quietly published `servo 0.1.0` to [crates.io](https://crates.io/crates/servo). A version number that small, on a crate that long-awaited, is a bit like seeing a lighthouse you'd written off as decommissioned suddenly blink twice. So it's still alive.

It sent me back. Servo was open-sourced by Mozilla at roughly the same time my company, [Cliqz](https://cliqz.com), was wound down. We were building an independent browser, an independent search index, and a privacy-preserving telemetry stack to back both. We lost. Servo, in a different way, also lost — handed off to the Linux Foundation in 2020 and largely dormant for years. I had put a lot of hope in another independent engine. The web has Blink, Gecko, and WebKit. That is not three engines; that's two-and-a-half, and on iOS it is one.

Two things changed recently. The Servo team is shipping again. And the EU, via the DMA, finally pried open iOS so that browsers other than WebKit can — in theory — run on the device in your pocket. *In theory.* That qualifier is the entire post.

I had Friday and Saturday evening. I wanted to see how far I could get.

## The 0.1.0 crate, and what it actually gives you

The `servo` crate is not a browser. It is an embeddable engine: parser, layout, scripting, networking, compositor — wrapped behind a Rust API that an embedder drives. You bring the window, the GL context, the event loop. Servo paints. That separation is exactly what makes "port to iOS" feel tractable in evenings instead of months. iOS already has windows, a perfectly good event loop, and (with caveats) a GL-ish surface. The trick is to make Servo's compositor draw into *that*.

The crate's existing embedder examples target desktop: GLFW on Linux/macOS, winit, a smattering of Android. None target iOS. That's fine — it just means we get to be the first ones to find out where the assumptions live.

## Evening one: surfman, and the joy of re-enabling old code

Servo's compositor speaks to the GPU through [`surfman`](https://github.com/servo/surfman), a Rust crate that abstracts cross-platform native surfaces and GL contexts. It has backends for EGL, CGL, WGL, ANGLE, OSMesa — and, buried in git history, an iOS backend that someone clearly wrote, exercised once, and then watched bit-rot for several years.

Re-enabling it was the most satisfying kind of work: chasing `cfg(target_os = "ios")` guards, replacing a few APIs that Apple has politely deprecated, and re-pointing one or two crate features that had drifted. After about ninety minutes I had `surfman` compiling for `aarch64-apple-ios`. After another forty I had it producing a context and a surface that didn't immediately panic. Hardly a triumph — but the lights were on.

```bash
$ cargo build --target aarch64-apple-ios -p surfman --features ios
   Compiling surfman v0.9.x (https://github.com/servo/surfman)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 41.22s
$ cargo test --target aarch64-apple-ios -p surfman --features ios -- --list
"create_context_and_surface": ok
"swap_buffers": ok
```

The naive plan from there was: build Servo with the iOS surfman backend, link the resulting static lib into a tiny SwiftUI host app, point it at `https://servo.org`, and watch the rendering land in a `CAMetalLayer`. That's what evening two was for.

## Evening two: ANGLE, and where iOS stops being friendly

iOS has not had a real OpenGL ES driver since iOS 12, when Apple deprecated it. The system frameworks still expose the API, the symbols still link, but you are quietly running on a software emulation path that is a couple of orders of magnitude too slow for a browser compositor. Apple's intended replacement is Metal. Servo's compositor speaks GL.

The bridge here is [**ANGLE**](https://github.com/google/angle), Google's GLES-on-top-of-anything translator. Chromium uses it to run on Windows (GLES → D3D11), and there's a Metal backend, originally contributed by Apple themselves, that translates GLES calls into Metal command buffers. If we can get Servo's surfman to talk to ANGLE-on-Metal instead of system EGL, we get hardware acceleration on iOS without rewriting Servo's compositor.

> surfman → ANGLE (libGLESv2.dylib + libEGL.dylib) → Metal → CAMetalLayer.
> Every arrow is an ABI you have to align by hand.

In theory: drop in ANGLE, point surfman at its EGL, done. In practice you spend a long Saturday discovering that:

1. ANGLE's iOS build is real, but the official prebuilts are scarce; you compile it from `depot_tools`, which adds a Python toolchain to your evening.
2. surfman's EGL backend assumes a Khronos-shaped `EGLNativeWindowType`. ANGLE-Metal wants a `CAMetalLayer*`. The two types unify if you squint — and pass the right `EGL_ANGLE_*` attribute on context creation.
3. iOS won't let you do GPU work in the background, so the moment your test app loses focus the EGL context is gone and Servo's compositor thread will happily try to draw into it anyway. Servo has lifecycle hooks for this; the embedder has to wire them.

By Saturday at midnight I had servo.org rendering inside a SwiftUI `UIViewRepresentable`, animating, scrolling, and — most importantly — running the compositor on the GPU instead of the CPU. The text was in the wrong place; touch input was not yet wired; `fetch()` didn't have a working TLS root store. But it was Servo. On iPhone. Hardware-accelerated.

## What this is, and what it isn't

It is not a browser. It is not even close to a browser. It is a proof that the path is unblocked: surfman builds for iOS, ANGLE-on-Metal carries the GL traffic, the DMA's "alternative engine" entitlement is real and the tooling around it is documented enough to follow.

It is also a small bet that mattered to me personally. I spent years arguing that the web needs more than two-and-a-half engines, and that mobile is where the monoculture bites hardest. The doors are opening — slowly, only in the EU, with entitlements and review processes that are not what anyone would call welcoming. But they are open. And the engine you'd most want to put through them is *shipping again*.

If you want to follow along, the patch series is on my [GitHub](https://github.com/chrmod). The next evening goes to input plumbing and a real TLS store. After that, the question stops being *can it run* and starts being *should it*.
