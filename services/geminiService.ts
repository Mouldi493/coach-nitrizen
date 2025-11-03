
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_INSTRUCTION, get_user_profile, get_recent_meals, save_meal_log, log_coaching_event } from '../constants';
import { availableTools } from './toolService';

// --- Audio Helper Functions ---

const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

const encode = (bytes: Uint8Array): string => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
};

const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
};

// --- Gemini Service ---

export interface SessionCallbacks {
    onMessage: (message: LiveServerMessage) => void;
    onError: (error: ErrorEvent) => void;
    onClose: (event: CloseEvent) => void;
}

class GeminiService {
    private ai: GoogleGenAI;
    private sessionPromise: Promise<LiveSession> | null = null;
    private mediaStream: MediaStream | null = null;
    private inputAudioContext: AudioContext | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null;

    private outputAudioContext: AudioContext;
    private outputNode: GainNode;
    private sources = new Set<AudioBufferSourceNode>();
    private nextStartTime = 0;

    constructor() {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // @ts-ignore
        this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        this.outputNode = this.outputAudioContext.createGain();
        this.outputNode.connect(this.outputAudioContext.destination);
    }

    public async startSession(callbacks: SessionCallbacks): Promise<void> {
        this.sessionPromise = this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: SYSTEM_INSTRUCTION,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                tools: [{ functionDeclarations: [get_user_profile, get_recent_meals, save_meal_log, log_coaching_event] }],
            },
            callbacks: {
                onopen: async () => {
                    console.log('Session opened.');
                    await this.startMicrophone();
                },
                onmessage: async (message: LiveServerMessage) => {
                    callbacks.onMessage(message);
                    this.handleMessage(message);
                },
                onerror: (error: ErrorEvent) => {
                    console.error('Session error:', error);
                    callbacks.onError(error);
                    this.stopSession();
                },
                onclose: (event: CloseEvent) => {
                    console.log('Session closed.');
                    callbacks.onClose(event);
                },
            },
        });
    }

    private async handleMessage(message: LiveServerMessage) {
        if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
                console.log('Function call received:', fc);
                const tool = availableTools[fc.name as keyof typeof availableTools];
                if (tool) {
                    try {
                        const result = await tool(fc.args);
                        const session = await this.sessionPromise;
                        session?.sendToolResponse({
                            functionResponses: { id: fc.id, name: fc.name, response: { result } }
                        });
                    } catch (e) {
                        console.error(`Error executing tool ${fc.name}:`, e);
                    }
                }
            }
        }

        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (audioData) {
            await this.playAudio(audioData);
        }
        
        if (message.serverContent?.interrupted) {
            this.stopPlayback();
        }
    }

    private async playAudio(base64Audio: string) {
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        const audioBuffer = await decodeAudioData(decode(base64Audio), this.outputAudioContext, 24000, 1);
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);
        source.addEventListener('ended', () => this.sources.delete(source));
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
    }
    
    private stopPlayback() {
        for (const source of this.sources.values()) {
            source.stop();
        }
        this.sources.clear();
        this.nextStartTime = 0;
    }

    private async startMicrophone() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // @ts-ignore
            this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            this.mediaStreamSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
            this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

            this.scriptProcessor.onaudioprocess = (event: AudioProcessingEvent) => {
                const inputData = event.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                    int16[i] = inputData[i] * 32768;
                }
                const pcmBlob = {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000',
                };
                if (this.sessionPromise) {
                    this.sessionPromise.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                }
            };

            this.mediaStreamSource.connect(this.scriptProcessor);
            this.scriptProcessor.connect(this.inputAudioContext.destination);
        } catch (error) {
            console.error('Error starting microphone:', error);
        }
    }

    public async stopSession() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect();
            this.scriptProcessor = null;
        }
        if (this.mediaStreamSource) {
            this.mediaStreamSource.disconnect();
            this.mediaStreamSource = null;
        }
        if (this.inputAudioContext && this.inputAudioContext.state !== 'closed') {
            await this.inputAudioContext.close();
            this.inputAudioContext = null;
        }

        if (this.sessionPromise) {
            const session = await this.sessionPromise;
            session.close();
            this.sessionPromise = null;
        }
        this.stopPlayback();
    }
}

export const geminiService = new GeminiService();
