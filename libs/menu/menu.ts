enum Alignment {
    Left,
    Top = Left,
    Center,
    Right,
    Bottom = Right
}

enum ButtonId {
    A,
    B,
    Up,
    Right,
    Down,
    Left
}

namespace menu {
    export let consolePriority = ConsolePriority.Debug;
    export function log(msg: string) {
        console.add(consolePriority, `menu> ${msg}`);
    }

    /**
     * A rectangle that represents the bounds of an element
     */
    export class BoundingBox {
        originX: number;
        originY: number;
        width: number;
        height: number;

        /**
         * Creates a BoundingBox
         *
         * @param ox The left edge of the bounds
         * @param oy The top edge of the bounds
         * @param width The width of the bounds
         * @param height The height of the bounds
         */
        constructor(ox: number, oy: number, width: number, height: number) {
            this.originX = ox;
            this.originY = oy;
            this.width = width;
            this.height = height;
        }
    }
}





namespace menu {

    export class Menu extends Component {
        list: menu.VerticalList;
        root: menu.JustifiedContent;
        b: menu.node.Bounds;
        margin: number;
        onDidHide?: () => void;

        constructor(font?: image.Font) {
            super();
            this.margin = 10;

            const initHeight = this.margin;
            const finalHeight = screen.height - this.margin;
            const finalWidth = screen.width - this.margin;

            this.b = new menu.node.Bounds(initHeight, initHeight);
            const f = new menu.node.RoundedFrame(5, 1, 3);
            this.b.left = 30;
            this.b.top = 30;
            this.b.appendChild(f)

            this.list = new menu.VerticalList(finalWidth - 8, finalHeight - 8, font || image.font5, finalWidth - 24, finalHeight - 24);
            f.appendChild(this.list);
            this.root = new menu.JustifiedContent(this.b, Alignment.Center, Alignment.Center);
            this.appendChild(this.root);
        }

        addItem(name: string, handler: () => void) {
            const item = this.list.addItem(name, this.list.length);
            this.list.selectedItemIndex = 0;
            item.handler = handler;
        }

        private grow() {
            this.list.hide();
            const vert = this.b.animate(menu.setHeight)
                .from(this.margin)
                .to(screen.height - this.margin)
                .duration(200);
            const hori = this.b.animate(menu.setWidth)
                .from(this.margin)
                .to(screen.width - this.margin)
                .duration(200)
                .onEnded(() => {
                    this.list.show();
                    menu.state.focus(this.list.selectedItem, true);
                    this.onShown();
                    this.notifyChange();
                });
            vert.chain(hori);
            vert.start();
        }

        hide() {
            if (!this.visible) return;
            this.list.hide();
            const hori = this.b.animate(menu.setWidth)
                .from(150)
                .to(0)
                .duration(200)
            const vert = this.b.animate(menu.setHeight)
                .from(100)
                .to(this.margin)
                .duration(200)
                .onEnded(() => {
                    this.dispose();
                    this.visible = false;
                    this.onHidden();
                    this.notifyChange();
                    if (this.onDidHide)
                        this.onDidHide();
                });
            hori.chain(vert);
            hori.start();
        }

        show() {
            if (this.visible) return;
            this.visible = true;
            menu.state.setRoot(this);
            this.grow();
        }

        handleInput(button: number) {
            log(`input menu ${button}`)
            if (button == ButtonId.B)
                this.hide();
            return true;
        }
    }

    export class VerticalList extends Component {
        flow: menu.container.VerticalFlow;
        font: image.Font;
        private items: ListItem[];

        constructor(outerWidth: number, outerHeight: number, font: image.Font, innerWidth?: number, innerHeight?: number) {
            super();
            this.fixedWidth = outerWidth;
            this.fixedHeight = outerHeight;
            this.font = font;

            if (!innerWidth) innerWidth = outerWidth;
            if (!innerHeight) innerHeight = outerHeight;

            this.flow = new menu.container.VerticalFlow(innerWidth, innerHeight);
            this.items = [];

            const padding = new JustifiedContent(this.flow, Alignment.Center, Alignment.Center);
            this.appendChild(padding);
        }

        get length() {
            return this.items.length;
        }

        addItem(item: string, id: number): ListItem {
            const n = new ListItem(this.flow.width, this.font, item, id);
            n.fixedHeight = this.font.charHeight + 6;
            this.items.push(n);
            this.flow.appendChild(n);
            return n;
        }

        get selectedItemIndex(): number {
            for (let i = 0; i < this.items.length; ++i) {
                const item = this.items[i];
                if (item.selected)
                    return i;
            }
            return -1;
        }

        set selectedItemIndex(value: number) {
            for (let i = 0; i < this.items.length; ++i) {
                const item = this.items[i];
                const select = value == i;
                if (select != item.selected) {
                    item.selected = select;
                    //if (item.selected)
                    //    focus(item, true);
                }
            }
        }

        get selectedItem(): ListItem {
            for (let i = 0; i < this.items.length; ++i) {
                const item = this.items[i];
                if (item.selected)
                    return item;
            }
            return undefined;
        }

        handleInput(button: ButtonId) {
            log(`list input ${button}`)
            switch (button) {
                case ButtonId.A:
                    const item = this.selectedItem;
                    if (item && item.handler)
                        item.handler();
                    break;
                case ButtonId.Down:
                    for (let i = 0; i < this.items.length - 1; ++i) {
                        const item = this.items[i];
                        if (item.selected) {
                            item.selected = false;
                            i = i + 1;
                            this.items[i].selected = true;
                            menu.state.focus(this.items[i], true);
                            break;
                        }
                    }
                    break;
                case ButtonId.Up:
                    for (let i = 1; i < this.items.length; ++i) {
                        const item = this.items[i];
                        if (item.selected) {
                            item.selected = false;
                            i = i - 1;
                            this.items[i].selected = true;
                            menu.state.focus(this.items[i], true);
                            break;
                        }
                    }
                    break;
            }
            return true;
        }
    }

    export class ListItem extends Component {
        content: JustifiedContent;
        label: menu.container.ScrollingLabel;
        background: menu.node.RectNode;
        id: number;
        handler: () => void;

        constructor(labelWidth: number, font: image.Font, text: string, id: number) {
            super();

            this.background = new menu.node.RectNode(0);
            this.appendChild(this.background);

            this.label = new menu.container.ScrollingLabel(labelWidth, font, text);
            this.appendChild(new JustifiedContent(this.label, Alignment.Left, Alignment.Center));

            this.id = id;
            this.visible = true;
        }

        get selected() {
            return this.background.color != 0;
        }

        set selected(value: boolean) {
            const sel = this.background.color != 0;
            if (sel != value) {
                this.background.color = value ? 10 : 0;
                this.label.color = value ? 1 : 2;
                this.notifyChange();
            }
        }
    }
}
