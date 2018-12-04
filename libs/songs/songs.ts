//% groups='["other","Songs"]'
namespace music {
    class Track {
        melody: music.Melody;
        running: boolean;
        volume?: number
        
        constructor(melody: music.Melody, volume?: number) {
            this.melody = melody;
            this.running = false;
            this.volume = volume;
        }

        stop() {
            this.melody.stop();
            this.running = false;
        }

        play() {
            this.running = true;
            control.runInParallel(() => {
                if (this.volume == undefined) this.melody.playUntilDone();
                else this.melody.playUntilDone(this.volume);
                this.running = false;
            })
        }
    }

    //% fixedInstances
    export class Song {
        private tracks: Track[];
        private looping: boolean;

        /**
         * Create a new song
         * @param tracks an array of Melodys to convert to tracks in the song
         */
        constructor(tracks: music.Melody[]) {
            /*
            * note to self: Could / should also just accept strings as well, but hoping Melody can be extended to let melodys
            * be assigned an instrument / envelope / etc
            */
            if (!tracks) return undefined;
            this.tracks = tracks.map(t => new Track(t));
        }

        /**
         * Number of tracks currently in the song
         */
        get trackCount() {
            return this.tracks.length;
        }

        /**
         * Play the song once
         * @param song the song to play
         */
        //% weight=100 blockGap=8 group="Songs"
        //% blockId="songs_play" block="play song $this"
        play() {
            if (!this.isPlaying()) this.tracks.forEach(t => t.play());
        }

        /**
         * Play the given track once
         * @param index the track to play
         */
        playTrack(index: number) {
            const t = this.tracks[index];
            if (t && !t.running) t.play();
        }

        /**
         * Play the song in a loop
         * @param song the song to play
         */
        //% weight=95 blockGap=8 group="Songs"
        //% blockId="songs_loop" block="play song $this in a loop"
        loop() {
            if (this.isPlaying()) return;
            this.looping = true;

            control.runInParallel(() => {
                do {
                    this.play();
                    this.pauseUntilDone();
                } while(this.looping);
            })
        }

        /**
         * Stop playing the song
         * @param song the song to end
         */
        //% weight=90 blockGap=8 group="Songs"
        //% blockId="songs_stop" block="stop playing song $this"
        stop() {
            this.looping = false;
            this.tracks.forEach(t => t.stop());
        }

        /**
         * Returns true if this song is currently being played, and false otherwise
         */
        isPlaying(): boolean {
            return this.tracks.some(t => t.running);
        }

        /**
         * Pauses until the song is finished playing.
         */
        pauseUntilDone() {
            /**
             * TODO: interaction with looping? looping explicitly use this, and then add a `&& !this.looping` 
             * to cause this to truly continue till all loops are finished?
             */
            pauseUntil(() => !this.isPlaying());
        }

        /**
         * Add a new track to the song
         * @param track the track to add
         */
        addTrack(track: music.Melody) {
            if (track) {
                this.tracks.push(new Track(track));
            }
        }

        /**
         * Removes the track at the given index
         * @param index the index of the track you wish to remove
         * @return the Melody of the removed track
         */
        removeTrack(index: number): music.Melody {
            return this.tracks.removeAt(index).melody;
        }

        /**
         * Set the default output volume of the song
         * @param volume the volume between 0 and 256, eg: 128
         */
        //% weight=85 blockGap=8 group="Songs"
        //% blockId="songs_volume" block="set song $this volume to $vol"
        setVolume(vol: number) {
            this.tracks.forEach(t => t.volume = vol);
        }

        /**
         * Set the output volume for the given track
         * @param index the index of the selected track
         * @param volume the volume between 0 and 256, eg: 128
         */
        trackVolume(index: number, vol: number) {
            const t = this.tracks[index];
            if (t) t.volume = vol;
        }
    }

    //% fixedInstance whenUsed block="bit tune"
    export const bitTune = new Song([
        new Melody('C:1 R:5 B4:1 R:3 A:3'),
        new Melody('R:2 B:1 A:3 R:2 C#:4 R:2 B:1')
    ]);
}