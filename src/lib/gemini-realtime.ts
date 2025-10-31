import { GoogleGenerativeAI } from "@google/generative-ai";
import WebSocket from "ws";

interface GeminiRealtimeConfig {
  apiKey: string;
  model?: string;
}

export class GeminiRealtimeClient {
  private genAI: GoogleGenerativeAI;
  private ws: WebSocket | null = null;
  private model: string;
  private instructions: string = "";
  private onAudioCallback?: (audioData: Buffer) => void;
  private onTextCallback?: (text: string) => void;

  constructor(config: GeminiRealtimeConfig) {
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || "gemini-2.0-flash-exp";
  }

  /**
   * Set callback for when audio is received from Gemini
   */
  onAudioReceived(callback: (audioData: Buffer) => void) {
    this.onAudioCallback = callback;
  }

  /**
   * Set callback for when text is received from Gemini
   */
  onTextReceived(callback: (text: string) => void) {
    this.onTextCallback = callback;
  }

  async connect(streamCallId: string, agentUserId: string) {
    // Gemini Multimodal Live API endpoint
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${process.env.GEMINI_API_KEY}`;
    
    this.ws = new WebSocket(wsUrl);

    return new Promise((resolve, reject) => {
      if (!this.ws) return reject(new Error("WebSocket not initialized"));

      this.ws.on("open", () => {
        console.log("Gemini WebSocket connected");
        
        // Wait a bit to ensure WebSocket is fully ready
        setTimeout(() => {
          if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            reject(new Error("WebSocket not ready"));
            return;
          }

          try {
            // Send initial configuration
            this.ws.send(JSON.stringify({
              setup: {
                model: `models/${this.model}`,
                generation_config: {
                  response_modalities: ["AUDIO"],
                  speech_config: {
                    voice_config: {
                      prebuilt_voice_config: {
                        voice_name: "Aoede" // or "Puck", "Charon", "Kore", "Fenrir"
                      }
                    }
                  }
                },
                system_instruction: {
                  parts: [
                    {
                      text: this.instructions || "You are a helpful meeting assistant."
                    }
                  ]
                }
              }
            }));
            
            console.log("Gemini setup configuration sent");
            resolve(this);
          } catch (error) {
            console.error("Error sending Gemini setup:", error);
            reject(error);
          }
        }, 100); // 100ms delay
      });

      this.ws.on("message", (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Log detailed message structure
          if (message.serverContent?.modelTurn?.parts) {
            console.log("Gemini response parts:", JSON.stringify(message.serverContent.modelTurn.parts, null, 2));
          } else if (message.serverContent?.turnComplete) {
            console.log("Gemini turn complete:", message.usageMetadata);
          } else {
            console.log("Gemini message:", message);
          }
          
          // Handle different message types
          if (message.serverContent) {
            // Handle server responses (audio, text, etc.)
            this.handleServerContent(message.serverContent);
          }
        } catch (error) {
          console.error("Error parsing Gemini message:", error);
        }
      });

      this.ws.on("error", (error) => {
        console.error("Gemini WebSocket error:", error);
        reject(error);
      });

      this.ws.on("close", () => {
        console.log("Gemini WebSocket closed");
      });
    });
  }

  updateSession(config: { instructions: string }) {
    this.instructions = config.instructions;
    
    // Send session update to Gemini
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        client_content: {
          turns: [
            {
              role: "user",
              parts: [
                {
                  text: `System instruction update: ${config.instructions}`
                }
              ]
            }
          ],
          turn_complete: true
        }
      }));
    }
  }

  sendAudio(audioData: Buffer) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // Send audio data to Gemini
      this.ws.send(JSON.stringify({
        realtime_input: {
          media_chunks: [
            {
              mime_type: "audio/pcm",
              data: audioData.toString("base64")
            }
          ]
        }
      }));
    }
  }

  sendText(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        client_content: {
          turns: [
            {
              role: "user",
              parts: [
                {
                  text: text
                }
              ]
            }
          ],
          turn_complete: true
        }
      }));
    }
  }

  private handleServerContent(content: {
    modelTurn?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    turnComplete?: boolean;
  }) {
    // Handle audio and text responses
    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.inlineData?.mimeType?.includes("audio")) {
          // Process audio response
          const audioData = Buffer.from(part.inlineData.data, "base64");
          console.log("📢 Received audio from Gemini:", audioData.length, "bytes");
          
          // Call the audio callback if set
          if (this.onAudioCallback) {
            this.onAudioCallback(audioData);
          }
          
          // Send audio to Stream.io call
          this.handleAudioResponse(audioData);
        } else if (part.text) {
          console.log("💬 Gemini text response:", part.text);
          
          // Call the text callback if set
          if (this.onTextCallback) {
            this.onTextCallback(part.text);
          }
        } else {
          console.log("📦 Unknown part type:", Object.keys(part));
        }
      }
    }
    
    if (content.turnComplete) {
      console.log("✅ Gemini turn complete");
    }
  }

  private handleAudioResponse(audioData: Buffer) {
    // This would integrate with Stream.io's audio streaming
    // TODO: Send audio to Stream.io call participants
    console.log("🔊 Processing audio response:", audioData.length, "bytes");
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export async function connectGeminiToStreamCall(
  callId: string,
  agentUserId: string,
  instructions: string
): Promise<GeminiRealtimeClient> {
  const client = new GeminiRealtimeClient({
    apiKey: process.env.GEMINI_API_KEY!,
    model: "gemini-2.0-flash-exp"
  });

  await client.connect(callId, agentUserId);
  client.updateSession({ instructions });

  return client;
}
