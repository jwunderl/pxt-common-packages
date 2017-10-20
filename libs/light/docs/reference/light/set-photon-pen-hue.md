# set Photon Hue

Change the color **hue** of the photon on the pixel strip.

```sig
light.pixels.setPhotonPenHue(0)
```

The photon effect is a pulse of bright light moving through a strip of colored pixels.
You can change the color of the photon to whatever you want.

The color is a **hue** and not an _RGB_ number. This means that red light is `0` and red light is also `255`. All the other colors are between `0` and `255`. Color begins at red and ends up back at red.

## Parameters

* **hue**: a [number](/types/number) from 0 (red light) to 255 (red light again) for
the _hue_ of the color you want.
> Some standard numbers for hue are:
> * red - `0`
> * orange - `29`
> * yellow - `43`
> * green - `86`
> * aqua - `125`
> * blue - `170`
> * purple - `191`
> * magenta - `213`
> * pink - `234`
> * red - `255`


## Example

Pulse an rainbow photon forward and backward across the pixel strip.

```blocks
let hue = 0;
loops.forever(() => {
    light.pixels.setPhotonPenHue(hue)
    for (let i = 0; i < light.pixels.length(); i++) {
        light.pixels.photonForward(1)
        loops.pause(100)
    }
    light.pixels.photonFlip()
    hue = hue + 1;
})
```
## See also

[``||photon forward||``](/reference/light/photon-forward),
[``||photon flip||``](/reference/light/photon-flip),
[``||set photon pen color||``](/reference/light/set-photon-pen-color),
[``||photon mode||``](/reference/light/set-photon-mode)

```package
light
```
