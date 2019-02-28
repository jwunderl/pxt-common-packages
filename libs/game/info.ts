
/**
 * Head-up display
 */
//% color=#AA5585 weight=80 icon="\uf2bb" blockGap=8
//% groups='["Score", "Life", "Countdown", "Multiplayer"]'
//% blockGap=8
namespace info {
    enum Visibility {
        None = 0,
        Countdown = 1 << 0,
        Score = 1 << 1,
        Life = 1 << 2,
        Hud = 1 << 3,
        Multi = 1 << 4,
        UserHeartImage = 1 << 5
    }

    // TODO: split into HudVisibility (on InfoContext)
    //          and PlayerVisibility (on players)
    // enum HudVisibility {
    //     None = 0,
    //     Countdown = 1 << 0,
    //     Hud = 1 << 1,
    //     Multi = 1 << 2,
    //     UserHeartImage = 1 << 2
    // }

    // enum PlayerVisibility {
    //     None = 0,
    //     Score = 1 << 0,
    //     Life = 1 << 1,
    //     Icon = 1 << 2
    // }

    interface PlayerState {
        visibility: number;
        score: number;
        lives: number;
        lifeZeroHandler: () => void;
    }

    export class InfoContext {
        players: PlayerState[]; // TODO: store score and visibility from PlayerInfo's here
        visibility: number; // TODO: make this type Visibility pending https://github.com/Microsoft/pxt-arcade/issues/774
        countdown: number;
        countdownEndHandler: () => void;

        private scene: scene.Scene;

        constructor() {
            this.scene = game.currentScene();
            this.visibility = Visibility.Hud;
            this.countdown = undefined;
        }

        isActive() {
            return this.scene === game.currentScene();
        }
    }

    let players: PlayerInfo[] = [];
    let contextStack: InfoContext[];
    let infoContext: InfoContext;

    game.addScenePushHandler(() => {
        if (infoContext) {
            if (!contextStack) {
                contextStack = [];
            }

            contextStack.push(infoContext);
            infoContext = undefined;
        }
    });

    game.addScenePopHandler(() => {
        if (contextStack && contextStack.length && contextStack[contextStack.length - 1].isActive()) {
            infoContext = contextStack.pop();
        } else {
            infoContext = undefined;
        }
    });

    let _heartImage: Image;
    let _multiplierImage: Image;
    let _bgColor: number;
    let _borderColor: number;
    let _fontColor: number;

    function initHUD() {
        if (infoContext) return;
        infoContext = new InfoContext();

        // non of these images should have been set
        _heartImage = defaultHeartImage();
        _multiplierImage = defaultMultiplyImage();
        _bgColor = screen.isMono ? 0 : 1;
        _borderColor = screen.isMono ? 1 : 3;
        _fontColor = screen.isMono ? 1 : 3;

        game.eventContext().registerFrameHandler(scene.HUD_PRIORITY, () => {
            control.enablePerfCounter("info");
            showScoreAndLives();
            showCountdown();
        });

        function showCountdown() {
            if (infoContext.countdown !== undefined && infoContext.visibility & Visibility.Countdown) {
                const scene = game.currentScene();
                const remaining = infoContext.countdown - scene.millis();
                drawTimer(remaining);
                if (remaining <= 0) {
                    infoContext.countdown = undefined;
                    if (infoContext.countdownEndHandler) {
                        infoContext.countdownEndHandler();
                    } else {
                        game.over();
                    }
                }
            }
        }

        function showScoreAndLives() {
            if (infoContext.visibility & Visibility.Multi) {
                const ps = players.filter(p => !!p);
                ps.forEach(p => p.drawPlayer());
                ps.forEach(p => p.raiseLifeZero(false));
            } else {
                player1.drawScore();
                player1.drawLives();
                player1.raiseLifeZero(true);
            }
        }
    }

    function initMultiHUD() {
        if (infoContext.visibility & Visibility.Multi) return;

        infoContext.visibility |= Visibility.Multi;
        if (!_heartImage || !(infoContext.visibility & Visibility.UserHeartImage))
            _heartImage = defaultHeartImage();
        _multiplierImage = defaultMultiplyImage();
    }

    function defaultMultiplyImage() {
        if (infoContext.visibility & Visibility.Multi)
            return img`
                1 . 1
                . 1 .
                1 . 1
            `;
        else
            return img`
                1 . . . 1
                . 1 . 1 .
                . . 1 . .
                . 1 . 1 .
                1 . . . 1
            `;
    }

    function defaultHeartImage() {
        if (infoContext.visibility & Visibility.Multi)
            return screen.isMono ?
                img`
                . . 1 . 1 . .
                . 1 . 1 . 1 .
                . 1 . . . 1 .
                . . 1 . 1 . .
                . . . 1 . . .
            `
                :
                img`
                . . 1 . 1 . .
                . 1 2 1 4 1 .
                . 1 2 4 2 1 .
                . . 1 2 1 . .
                . . . 1 . . .
            `;
        else
            return screen.isMono ?
                img`
                . 1 1 . 1 1 . .
                1 . . 1 . . 1 .
                1 . . . . . 1 .
                1 . . . . . 1 .
                . 1 . . . 1 . .
                . . 1 . 1 . . .
                . . . 1 . . . .
            `
                :
                img`
                . c 2 2 . 2 2 .
                c 2 2 2 2 2 4 2
                c 2 2 2 2 4 2 2
                c 2 2 2 2 2 2 2
                . c 2 2 2 2 2 .
                . . c 2 2 2 . .
                . . . c 2 . . .
            `;

    }

    export function saveHighScore() {
        let hs = 0;
        players
            .filter(p => p && p.hasScore())
            .forEach(p => hs = Math.max(hs, p._score));
        updateHighScore(hs);
    }

    /**
     * Get the current score
     * @param player [optional] the player to get the score of
     */
    //% weight=95 blockGap=8
    //% blockId=hudScore block="score || %player"
    //% help=info/score
    //% group="Score"
    export function score(player?: PlayerInfo) {
        player = player ? player : player1;
        return player.score();
    }

    //% group="Score"
    export function hasScore() {
        return player1.hasScore();
    }

    /**
     * Get the last recorded high score
     */
    //% weight=94
    //% blockId=highScore block="high score"
    //% help=info/high-score
    //% group="Score"
    export function highScore(): number {
        return updateHighScore(0) || 0;
    }

    /**
     * Set the score
     * @param value the score to set
     * @param player [optional] the player to set the score of
     */
    //% weight=93 blockGap=8
    //% blockId=hudsetScore block="set score to $value || $player"
    //% help=info/set-score
    //% group="Score"
    export function setScore(value: number, player?: PlayerInfo) {
        player = player ? player : player1;
        player.setScore(value);
    }

    /**
     * Change the score by the given amount
     * @param value the amount of change, eg: 1
     * @param player [optional] the player to change the score of
     */
    //% weight=92
    //% blockId=hudChangeScoreBy block="change score by $value || $player"
    //% help=info/change-score-by
    //% group="Score"
    export function changeScoreBy(value: number, player?: PlayerInfo) {
        player = player ? player : player1;
        player.changeScoreBy(value);
    }

    /**
     * Get the number of lives
     * @param player [optional] the player to get the number of lives of
     */
    //% weight=85 blockGap=8
    //% blockId=hudLife block="life || $player"
    //% help=info/life
    //% group="Life"
    export function life(player?: PlayerInfo) {
        player = player ? player : player1;
        return player.life();
    }

    //% group="Life"
    export function hasLife() {
        return player1.hasLife();
    }

    /**
     * Set the number of lives
     * @param value the number of lives, eg: 3
     * @param player [optional] the player to set the life of
     */
    //% weight=84 blockGap=8
    //% blockId=hudSetLife block="set life to $value || $player"
    //% help=info/set-life
    //% group="Life"
    export function setLife(value: number, player?: PlayerInfo) {
        player = player ? player : player1;
        player.setLife(value);
    }

    /**
     * Change the lives by the given amount
     * @param value the change of lives, eg: -1
     * @param player [optional] the player to change the life of
     */
    //% weight=83
    //% blockId=hudChangeLifeBy block="change life by %value || $player"
    //% help=info/change-life-by
    //% group="Life"
    export function changeLifeBy(value: number, player?: PlayerInfo) {
        player = player ? player : player1;
        player.changeLifeBy(value);
    }

    /**
     * Run code when the player's life reaches 0. If this function
     * is not called then game.over() is called instead
     */
    //% weight=82
    //% blockId=gamelifeevent block="on life zero"
    //% help=info/on-life-zero
    //% group="Life"
    export function onLifeZero(handler: () => void) {
        player1.onLifeZero(handler);
    }

    /**
     * Get the current countdown duration in milliseconds
     */
    //% weight=80 blockGap=8
    //% blockId=hudCountdown block="countdown"
    //% group="Countdown"
    export function countdown() {
        return infoContext.countdown !== undefined ? infoContext.countdown - game.currentScene().millis() : 0;
    }

    /**
     * Start a countdown of the given duration in milliseconds
     * @param duration the duration of the countdown in ms, eg: 10000
     */
    //% blockId=gamecountdown block="start countdown %duration=countdownPicker ms"
    //% help=info/start-countdown weight=79 blockGap=8
    //% group="Countdown"
    export function startCountdown(duration: number) {
        updateFlag(Visibility.Countdown, true);
        infoContext.countdown = game.currentScene().millis() + duration;
    }

    /**
     * Change the current countdown by the given number of milliseconds
     * @param duration the change of the countdown in ms, eg: 5000
     */
    //% blockId=gamechangecountdownby block="change countdown by %duration=countdownPicker ms"
    //% weight=78 blockGap=8
    //% group="Countdown"
    export function changeCountdownBy(duration: number) {
        startCountdown(countdown() + duration);
    }

    /**
     * Stop the current countdown and hides the timer display
     */
    //% blockId=gamestopcountdown block="stop countdown" weight=78
    //% help=info/stop-countdown
    //% group="Countdown"
    export function stopCountdown() {
        updateFlag(Visibility.Countdown, false);
        infoContext.countdown = undefined;
    }

    /**
     * Run code when the countdown reaches 0. If this function
     * is not called then game.over() is called instead
     */
    //% blockId=gamecountdownevent block="on countdown end" weight=77
    //% help=info/on-countdown-end
    //% group="Countdown"
    export function onCountdownEnd(handler: () => void) {
        initHUD();
        infoContext.countdownEndHandler = handler;
    }

    /**
     * Replaces the image used to represent the player's lives. Images
     * should be no larger than 8x8
     */
    //% group="Life"
    export function setLifeImage(image: Image) {
        initHUD();
        _heartImage = image;
        updateFlag(Visibility.UserHeartImage, true);
    }

    /**
     * Set whether life should be displayed
     * @param on if true, lives are shown; otherwise, lives are hidden
     */
    //% group="Life"
    export function showLife(on: boolean) {
        updateFlag(Visibility.Life, on);
    }

    /**
     * Set whether score should be displayed
     * @param on if true, score is shown; otherwise, score is hidden
     */
    //% group="Score"
    export function showScore(on: boolean) {
        updateFlag(Visibility.Score, on);
    }

    /**
     * Set whether score should be displayed
     * @param on if true, score is shown; otherwise, score is hidden
     */
    //% group="Countdown"
    export function showCountdown(on: boolean) {
        updateFlag(Visibility.Countdown, on);
    }

    function updateFlag(flag: Visibility, on: boolean) {
        initHUD();
        if (on) infoContext.visibility |= flag;
        else infoContext.visibility = ~(~(infoContext.visibility as number) | flag);
    }

    /**
     * Sets the color of the borders around the score, countdown, and life
     * elements. Defaults to 3
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setBorderColor(color: number) {
        _borderColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Sets the color of the background of the score, countdown, and life
     * elements. Defaults to 1
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setBackgroundColor(color: number) {
        _bgColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Sets the color of the text used in the score, countdown, and life
     * elements. Defaults to 3
     * @param color The index of the color (0-15)
     */
    //% group="Theme"
    export function setFontColor(color: number) {
        _fontColor = Math.min(Math.max(color, 0), 15) | 0;
    }

    /**
     * Get the current color of the borders around the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function borderColor(): number {
        return _borderColor ? _borderColor : 3;
    }

    /**
     * Get the current color of the background of the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function backgroundColor(): number {
        return _bgColor ? _bgColor : 1;
    }

    /**
     * Get the current color of the text usded in the score, countdown, and life
     * elements
     */
    //% group="Theme"
    export function fontColor(): number {
        return _fontColor ? _fontColor : 3;
    }

    function drawTimer(millis: number) {
        if (millis < 0) millis = 0;
        millis |= 0;

        const font = image.font8;
        const smallFont = image.font5;
        const seconds = Math.idiv(millis, 1000);
        const width = font.charWidth * 5 - 2;
        let left = (screen.width >> 1) - (width >> 1) + 1;
        let color1 = _fontColor;
        let color2 = _bgColor;

        if (seconds < 10 && (seconds & 1) && !screen.isMono) {
            const temp = color1;
            color1 = color2;
            color2 = temp;
        }

        screen.fillRect(
            left - 3,
            0,
            width + 6,
            font.charHeight + 3,
            _borderColor
        );
        screen.fillRect(
            left - 2,
            0,
            width + 4,
            font.charHeight + 2,
            color2
        );

        if (seconds < 60) {
            const top = 1;
            const remainder = Math.idiv(millis % 1000, 10);

            screen.print(
                formatDecimal(seconds) + ".",
                left,
                top,
                color1,
                font
            );
            const decimalLeft = left + 3 * font.charWidth;
            screen.print(
                formatDecimal(remainder),
                decimalLeft,
                top + 2,
                color1,
                smallFont
            );
        } else {
            const minutes = Math.idiv(seconds, 60);
            const remainder = seconds % 60;
            screen.print(
                formatDecimal(minutes) + ":" + formatDecimal(remainder),
                left,
                1,
                color1,
                font
            );
        }
    }

    //% fixedInstances
    //% blockGap=8
    export class PlayerInfo {
        _score: number;
        _life: number;
        _player: number;
        bg: number; // background color
        border: number; // border color
        fc: number; // font color
        visilibity: Visibility;
        showScore?: boolean;
        showLife?: boolean;
        showPlayer?: boolean;
        x?: number;
        y?: number;
        left?: boolean; // if true banner goes from x to the left, else goes rightward
        up?: boolean; // if true banner goes from y up, else goes downward

        private _lifeZeroHandler?: () => void; // onPlayerLifeOver handler

        constructor(player: number) {
            this._player = player;
            this.border = 1;
            this.fc = 1;
            this._life = null;
            this._score = null;
            this.visilibity = Visibility.None;
            this.showScore = null;
            this.showLife = null;
            this.showPlayer = null;
            this.left = null;
            this.up = null;
            if (this._player === 1) {
                // Top left, and banner is white on red
                this.bg = screen.isMono ? 0 : 2;
                this.x = 0;
                this.y = 0;
            } else if (player === 2) {
                // Top right, and banner is white on blue
                this.bg = screen.isMono ? 0 : 8;
                this.x = screen.width;
                this.y = 0;
                this.left = true;
            } else if (player === 3) {
                // bottom left, and banner is white on orange
                this.bg = screen.isMono ? 0 : 4;
                this.x = 0;
                this.y = screen.height;
                this.up = true;
            } else {
                // bottom right, banner is white on green
                this.bg = screen.isMono ? 0 : 7;
                this.x = screen.width;
                this.y = screen.height;
                this.left = true;
                this.up = true;
            }

            initHUD();
            if (this._player > 1)
                initMultiHUD();
            players[this._player - 1] = this;
        }

        private initScore() {
            if (this.showScore === null)
                this.showScore = true;
            if (this.showPlayer === null)
                this.showPlayer = true;
        }

        private initLife() {
            if (this.showLife === null)
                this.showLife = true;
            if (this.showPlayer === null)
                this.showPlayer = true;
        }

        /**
         * Get the player score
         */
        score(): number {
            this.initScore();

            if (!this._score) {
                this._score = 0;
                saveHighScore();
            }
            return this._score;
        }

        /**
         * Set the player score
         */
        setScore(value: number) {
            this.initScore();
            updateFlag(Visibility.Score, true);
            this._score = (value | 0);
        }

        /**
         * Change the score of a player
         * @param value 
         */
        changeScoreBy(value: number): void {
            this.initScore();
            this.setScore(this.score() + value);
        }

        hasScore() {
            return this._score !== null;
        }

        /**
         * Get the player life
         */
        life(): number {
            this.initLife();

            if (this._life === null) {
                this._life = 3;
            }
            return this._life;
        }

        /**
         * Set the player life
         */
        setLife(value: number): void {
            this.initLife();
            updateFlag(Visibility.Life, true);
            this._life = (value | 0);
        }

        /**
         * Change the life of a player
         * @param value 
         */
        changeLifeBy(value: number): void {
            this.initLife();
            this.setLife(this.life() + value);
        }

        /**
         * Return true if the given player currently has a value set for health,
         * and false otherwise.
         * @param player player to check life of
         */
        hasLife(): boolean {
            return this._life !== null;
        }

        /**
         * Runs code when life reaches zero
         * @param handler 
         */
        //% group="Multiplayer"
        //% blockId=playerinfoonlifezero block="on %player life zero"
        //% help=info/on-life-zero
        onLifeZero(handler: () => void) {
            this._lifeZeroHandler = handler;
        }

        raiseLifeZero(gameOver: boolean) {
            if (this._life !== null && this._life <= 0) {
                this._life = null;
                if (this._lifeZeroHandler) this._lifeZeroHandler();
                else if (gameOver) game.over();
            }
        }

        drawPlayer() {
            const font = image.font5;
            let score: string;
            let life: string;
            let height = 4;
            let scoreWidth = 0;
            let lifeWidth = 0;
            const offsetX = 1;
            let offsetY = 2;
            let showScore = this.showScore && this._score !== null;
            let showLife = this.showLife && this._life !== null;

            if (showScore) {
                score = "" + this._score;
                scoreWidth = score.length * font.charWidth + 3;
                height += font.charHeight;
                offsetY += font.charHeight + 1;
            }

            if (showLife) {
                life = "" + this._life;
                lifeWidth = _heartImage.width + _multiplierImage.width + life.length * font.charWidth + 3;
                height += _heartImage.height;
            }

            const width = Math.max(scoreWidth, lifeWidth);

            // bump size for space between lines
            if (showScore && showLife) height++;

            const x = this.x - (this.left ? width : 0);
            const y = this.y - (this.up ? height : 0);

            // Bordered Box
            if (showScore || showLife) {
                screen.fillRect(
                    x,
                    y,
                    width,
                    height,
                    this.border
                );
                screen.fillRect(
                    x + 1,
                    y + 1,
                    width - 2,
                    height - 2,
                    this.bg
                );
            }

            // print score
            if (showScore) {
                const bump = this.left ? width - scoreWidth : 0;
                screen.print(
                    score,
                    x + offsetX + bump + 1,
                    y + 2,
                    this.fc,
                    font
                );
            }

            // print life
            if (showLife) {
                const xLoc = x + offsetX + (this.left ? width - lifeWidth : 0);

                const mult = _multiplierImage.clone();
                mult.replace(1, this.fc);

                screen.drawTransparentImage(
                    _heartImage,
                    xLoc,
                    y + offsetY
                );
                screen.drawTransparentImage(
                    mult,
                    xLoc + _heartImage.width,
                    y + offsetY + font.charHeight - _multiplierImage.height - 1
                );
                screen.print(
                    life,
                    xLoc + _heartImage.width + _multiplierImage.width + 1,
                    y + offsetY,
                    this.fc,
                    font
                );
            }

            // print player icon
            if (this.showPlayer) {
                const pNum = "" + this._player;

                const iconWidth = pNum.length * font.charWidth + 1;
                const iconHeight = Math.max(height, font.charHeight + 2);
                let iconX = this.left ? (x - iconWidth + 1) : (x + width - 1);
                let iconY = y;

                // adjustments when only player icon shown
                if (!showScore && !showLife) {
                    iconX += this.left ? -1 : 1;
                    if (this.up) iconY -= 3;
                }

                screen.fillRect(
                    iconX,
                    iconY,
                    iconWidth,
                    iconHeight,
                    this.border
                );
                screen.print(
                    pNum,
                    iconX + 1,
                    iconY + (iconHeight >> 1) - (font.charHeight >> 1),
                    this.bg,
                    font
                );
            }
        }

        drawScore() {
            if (!this.hasScore() || !(infoContext.visibility & Visibility.Score))
                return
            const s = this.score();

            let font: image.Font;
            let offsetY: number;
            if (s >= 1000000) {
                offsetY = 2;
                font = image.font5;
            }
            else {
                offsetY = 1;
                font = image.font8;
            }

            const num = s + "";
            const width = num.length * font.charWidth;

            screen.fillRect(
                screen.width - width - 2, 0,
                screen.width,
                image.font8.charHeight + 3,
                _borderColor
            );
            screen.fillRect(
                screen.width - width - 1, 0,
                screen.width,
                image.font8.charHeight + 2,
                _bgColor
            );
            screen.print(
                num,
                screen.width - width,
                offsetY,
                _fontColor,
                font
            );
        }

        drawLives() {
            if (!this.hasLife() || this._life < 0 || !(infoContext.visibility & Visibility.Life))
                return

            const font = image.font8;
            if (this._life <= 4) {
                screen.fillRect(
                    0,
                    0,
                    this._life * (_heartImage.width + 1) + 3,
                    _heartImage.height + 4,
                    _borderColor
                );
                screen.fillRect(
                    0,
                    0,
                    this._life * (_heartImage.width + 1) + 2,
                    _heartImage.height + 3,
                    _bgColor
                );
                for (let i = 0; i < this._life; i++) {
                    screen.drawTransparentImage(
                        _heartImage,
                        1 + i * (_heartImage.width + 1),
                        1
                    );
                }
            } else {
                const num = this._life + "";
                const textWidth = num.length * font.charWidth - 1;
                screen.fillRect(
                    0,
                    0,
                    _heartImage.width + _multiplierImage.width + textWidth + 5,
                    _heartImage.height + 4,
                    _borderColor
                );
                screen.fillRect(
                    0,
                    0,
                    _heartImage.width + _multiplierImage.width + textWidth + 4,
                    _heartImage.height + 3,
                    _bgColor
                );
                screen.drawTransparentImage(
                    _heartImage,
                    1,
                    1
                );

                let mult = _multiplierImage.clone();
                mult.replace(1, _fontColor);

                screen.drawTransparentImage(
                    mult,
                    _heartImage.width + 2,
                    font.charHeight - _multiplierImage.height - 1
                );
                screen.print(
                    num,
                    _heartImage.width + 3 + _multiplierImage.width,
                    1,
                    _fontColor,
                    font
                );
            }
        }
    }

    function formatDecimal(val: number) {
        val |= 0;
        if (val < 10) {
            return "0" + val;
        }
        return val + "";
    }

    //% fixedInstance whenUsed block="player 1"
    export const player1 = new PlayerInfo(1);
    //% fixedInstance whenUsed block="player 2"
    export const player2 = new PlayerInfo(2);
    //% fixedInstance whenUsed block="player 3"
    export const player3 = new PlayerInfo(3);
    //% fixedInstance whenUsed block="player 4"
    export const player4 = new PlayerInfo(4);

    /**
      * Get the countdown time field editor
      * @param ms time duration in milliseconds, eg: 5000, 10000
      */
    //% blockId=countdownPicker block="%ms"
    //% blockHidden=true shim=TD_ID
    //% colorSecondary="#FFFFFF"
    //% ms.fieldEditor="numberdropdown" ms.fieldOptions.decompileLiterals=true
    //% ms.fieldOptions.data='[["500 ms", 500],["5 seconds", 5000], ["10 seconds", 10000], ["20 seconds", 20000], ["30 seconds", 30000]]'
    export function __countdownTimePicker(ms: number): number {
        return ms;
    }
}

declare namespace info {
    /**
     * Sends the current score and the new high score
     */
    //% shim=info::updateHighScore
    function updateHighScore(score: number): number;
}
