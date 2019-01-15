namespace menu.node {
    export class Frame extends Node {
        source: FrameSource;
        innerFill: number;

        constructor(source: FrameSource, innerFill: number) {
            super();
            this.source = source;
            this.innerFill = innerFill;
        }

        drawSelf(canvas: Image, available: menu.BoundingBox) {
            this.source.draw(canvas, available, this.innerFill);
        }

        getBounds(available: menu.BoundingBox) {
            const width = this.fixedWidth || available.width;
            const height = this.fixedHeight || available.height;
            return this.source.getBounds(width, height);
        }
    }

    export class FrameSource {
        source: Image;

        rw: number;
        lw: number;
        th: number;
        bh: number;

        constructor(source: Image) {
            this.source = source;

            const vUnit = (source.height / 3) | 0;
            this.th = vUnit;
            this.bh = vUnit;

            const hUnit = (source.width / 3) | 0;
            this.rw = hUnit;
            this.lw = hUnit;
        }

        getBounds(width: number, height: number) {
            return new menu.BoundingBox(
                this.lw,
                this.th,
                width - this.rw - this.lw,
                height - this.bh - this.th);
        }

        drawPartial(canvas: Image, ox: number, oy: number, x: number, y: number, w: number, h: number) {
            for (let i = 0; i < w; i++) {
                for (let j = 0; j < h; j++) {
                    canvas.setPixel(ox + i, oy + j, this.source.getPixel(x + i, y + j));
                }
            }
        }

        draw(canvas: Image, bb: menu.BoundingBox, innerFill: number) {
            const cl = bb.originX
            const ct = bb.originY;
            const cr = bb.originX + bb.width - this.rw;
            const cb = bb.originY + bb.height - this.bh;

            const sr = this.source.width - this.rw;
            const sb = this.source.height - this.bh;

            this.drawPartial(canvas, cl, ct, 0, 0, this.lw, this.th);
            this.drawPartial(canvas, cr, ct, sr, 0, this.rw, this.th);
            this.drawPartial(canvas, cr, cb, sr, sb, this.rw, this.bh);
            this.drawPartial(canvas, cl, cb, 0, sb, this.lw, this.bh);

            const innerWidth = bb.width - this.rw - this.lw;
            this.drawHorizontal(canvas, cl + this.lw, ct, innerWidth, true);
            this.drawHorizontal(canvas, cl + this.lw, cb, innerWidth, false);

            const innerHeight = bb.height - this.bh - this.th;
            this.drawVertical(canvas, cl, ct + this.th, innerHeight, true);
            this.drawVertical(canvas, cr, ct + this.th, innerHeight, false);

            canvas.fillRect(cl + this.lw, ct + this.th, innerWidth, innerHeight, innerFill);
        }

        drawHorizontal(canvas: Image, ox: number, oy: number, width: number, useTop: boolean) {
            const x = this.lw;
            const y = useTop ? 0 : this.source.height - this.bh;
            const sourceWidth = this.source.width - this.lw - this.rw;
            const sourceHeight = useTop ? this.th : this.bh;

            for (let column = 0; column < width; column++) {
                for (let row = 0; row < sourceHeight; row++) {
                    canvas.setPixel(
                        ox + column,
                        oy + row,
                        this.source.getPixel(x + (column % sourceWidth), y + row)
                    )
                }
            }
        }

        drawVertical(canvas: Image, ox: number, oy: number, height: number, useLeft: boolean) {
            const x = useLeft ? 0 : this.source.width - this.rw;
            const y = this.th;
            const sourceWidth = useLeft ? this.lw : this.rw;
            const sourceHeight = this.source.height - this.th - this.bh;

            for (let column = 0; column < sourceWidth; column++) {
                for (let row = 0; row < height; row++) {
                    canvas.setPixel(
                        ox + column,
                        oy + row,
                        this.source.getPixel(x + column, y + (row % sourceHeight))
                    )
                }
            }
        }
    }
}