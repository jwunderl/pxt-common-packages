namespace menu.node {
    export class ListItem extends Component {
        content: JustifiedContent;
        label: menu.node.ScrollingLabel;
        background: menu.node.RectNode;
        id: number;
        handler: () => void;

        constructor(labelWidth: number, font: image.Font, text: string, id: number) {
            super();

            this.background = new menu.node.RectNode(0);
            this.appendChild(this.background);

            this.label = new menu.node.ScrollingLabel(labelWidth, font, text);
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