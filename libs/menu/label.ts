namespace menu.node {

    export class Label extends menu.node.Container {
        fullString: string;
        font: image.Font;
        color: number;
        text: menu.node.TextNode;

        constructor(width: number, font: image.Font, content: string) {
            super(width, font.charHeight);
            this.fullString = content;
            this.font = font;

            this.text = new menu.node.TextNode(this.font, content, 1);
            this.appendChild(this.text);
        }
    }

    /**
     * A label that scrolls its content in a loop
     */
    export class ScrollingLabel extends Label {
        pause: number;
        speed: number;
        timer: number;

        maxOffset: number;

        private _scrolling: boolean;
        private _offset: number;

        get scrolling() {
            return this._scrolling;
        }

        set scrolling(v: boolean) {
            if (v === this._scrolling) return;
            this._scrolling = v;
            this.timer = this.pause;

            if (this.offset !== 0) {
                this.offset = 0;
                this.notifyChange();
            }
        }

        get offset() {
            return this._offset;
        }

        set offset(o: number) {
            this._offset = 0;
            this.text.left = -(o | 0);
        }

        constructor(width: number, font: image.Font, content: string) {
            super(width, font, content);
            this.pause = 750;
            this.speed = 1 / 100;
            this.offset = 0;
            this.timer = this.pause;
            this.scrolling = false;

            this.maxOffset = content.length * this.font.charWidth - this.width;

            if (this.maxOffset > 0)
                menu.state.subscribe(this);
        }

        update(dt: number) {
            if (this.width <= this.maxOffset) return;

            if (this.timer > 0) {
                this.timer -= dt;

                if (this.timer <= 0 && this.offset) {
                    this.offset = 0;
                    this.timer = this.pause;
                }
            } else {
                this.offset += dt * this.speed;

                if (this.offset > this.maxOffset) {
                    this.offset = this.maxOffset;
                    this.timer = this.pause;
                }

                this.notifyChange();
            }
        }

        dispose() {
            super.dispose();
            menu.state.unsubscribe(this);
        }
    }
}