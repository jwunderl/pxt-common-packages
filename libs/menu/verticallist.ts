namespace menu {
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
}