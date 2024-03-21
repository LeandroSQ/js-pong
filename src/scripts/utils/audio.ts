import { AUDIO_VOLUME } from "../constants";

export class AudioSynth {

	private static context: AudioContext;
	private static gainNode: GainNode;
	private static oscillator: OscillatorNode;
	private static isPlaying = false;

	static async setup() {
		this.context = new AudioContext();
		this.gainNode = this.context.createGain();
		this.gainNode.connect(this.context.destination);
		this.gainNode.gain.setValueAtTime(AUDIO_VOLUME, this.context.currentTime);
	}

	static play(frequency: number, duration: number) {
		if (this.isPlaying) {
			this.oscillator.stop();
		}

		this.oscillator = this.context.createOscillator();
		this.oscillator.connect(this.gainNode);
		this.oscillator.type = "sine";
		this.oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
		this.oscillator.start();
		this.oscillator.stop(this.context.currentTime + duration / 1000);
		this.isPlaying = true;
	}

}