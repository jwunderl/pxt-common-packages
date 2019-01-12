// previous test examples that don't currently work

// const container = new Menu.HorizontalFlow(100, 100);

// const columns = 4;
// const rows = 4;

// for (let c = 0; c < columns; c++) {
//     const column = new Menu.VerticalFlow(container.width / columns, container.height);
//     container.appendChild(column)
//     for (let r = 0; r < rows; r++) {
//         const rect = new Menu.RectNode(((c + r) & 1) ? 7 : 6);
//         const text = new Menu.TextNode(image.font5, `(${c},${r})`, 1);
//         rect.appendChild(text);
//         column.appendChild(new Menu.JustifiedContent(rect, Alignment.Center, Alignment.Center));
//     }
// }

// Menu.setRoot(container);



// const commands = [
//     "MOVE",
//     "TALK",
//     "FLEE",
//     "ITEM"
// ];

// const root = new Menu.VerticalList(screen.width, screen.height, screen.width >> 2, screen.height >> 1);
// commands.forEach(function (value: string, index: number) {
//     root.addItem(value, index);
// })
// Menu.setRoot(root);
// root.show();

// const initHeight = 12;
// const f = new Menu.RoundedFrame(5, 1, 3);
// const b = new Menu.Bounds(initHeight, initHeight);
// b.left = 30;
// b.top = 30;
// b.appendChild(f)

// controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
//     const vert = b.animate(setHeight)
//         .from(initHeight)
//         .to(100)
//         .duration(200);

//     const hori = b.animate(setWidth)
//         .from(initHeight)
//         .to(150)
//         .duration(200);

//     vert.chain(hori);
//     vert.start();
// })

// controller.B.onEvent(ControllerButtonEvent.Pressed, () => {
//     const vert = b.animate(setHeight)
//         .from(100)
//         .to(initHeight)
//         .duration(200);

//     const hori = b.animate(setWidth)
//         .from(150)
//         .to(initHeight)
//         .duration(200);

//     hori.chain(vert);
//     hori.start();
// })

// const root = new Menu.JustifiedContent(b, Alignment.Center, Alignment.Center);
// Menu.setRoot(root);


/** throw this one in an arcade project to get menu */

// scene.systemMenu.register(); // repeat every new scene for now
// scene.systemMenu.addEntry(
//     function () { return "volume up" },
//     function () {
//         const v = music.volume();
//         music.setVolume(v + 32);
//         music.playTone(440, 500);
//     }, true);
// scene.systemMenu.addEntry(
//     function () { return "volume down" },
//     function () {
//         const v = music.volume();
//         music.setVolume(v - 32);
//         music.playTone(440, 500);
//     }, true);