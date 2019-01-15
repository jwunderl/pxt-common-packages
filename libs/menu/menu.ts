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
}
