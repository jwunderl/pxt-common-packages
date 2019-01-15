namespace menu.node {
    export class RoundedFrame extends Frame {
        constructor(cornerRadius: number, borderColor: number, innerFill: number) {
            super(mkRoundedFrame(cornerRadius, borderColor, innerFill), innerFill);
        }
    }

    function mkRoundedFrame(radius: number, borderColor: number, innerFill: number) {
        const result = image.create((radius << 1) + 1, (radius << 1) + 1);
        drawCircle(result, radius, radius, radius, borderColor);

        for (let x = 1; x < result.width - 1; ++x) {
            let s = 0;
            for (let y = 0; y < result.height; ++y) {
                if (result.getPixel(x, y)) {
                    if (!s) {
                        s = 1;
                    } else if (s === 2) {
                        s = 3;
                    }
                } else if (s === 1) {
                    s = 2;
                }

                if (s === 2)
                    result.setPixel(x, y, innerFill);
            }
        }

        const source = new FrameSource(result);
        source.lw = radius;
        source.rw = radius;
        source.th = radius;
        source.bh = radius;

        return source;
    }

    // https://en.wikipedia.org/wiki/Midpoint_circle_algorithm
    function drawCircle(canvas: Image, x0: number, y0: number, radius: number, color: number) {
        let x = radius;
        let y = 0;
        let err = 0;

        while (x >= y) {
            canvas.setPixel(x0 + x, y0 + y, color);
            canvas.setPixel(x0 + x, y0 - y, color);
            canvas.setPixel(x0 + y, y0 + x, color);
            canvas.setPixel(x0 + y, y0 - x, color);
            canvas.setPixel(x0 - y, y0 + x, color);
            canvas.setPixel(x0 - y, y0 - x, color);
            canvas.setPixel(x0 - x, y0 + y, color);
            canvas.setPixel(x0 - x, y0 - y, color);

            if (err <= 0) {
                y += 1;
                err += 2 * y + 1;
            }

            if (err > 0) {
                x -= 1;
                err -= 2 * x + 1;
            }
        }
    }
}