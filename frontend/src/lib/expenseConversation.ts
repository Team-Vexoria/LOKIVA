import { routeVoiceInput, UserSessionContext, VoiceRouteResponse } from './voiceRouter';

export type ConversationState = 'IDLE' | 'ACTIVE_SESSION';

export interface ExpenseMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  amount_inr?: number;
  category?: string;
}

export interface ExpenseConversationCallbacks {
  onStateChange: (state: ConversationState) => void;
  onMessagesChange: (messages: ExpenseMessage[]) => void;
  onTotalChange: (todayTotal: number) => void;
  onAssistantSpeak: (text: string) => void;
  onRequestListen: () => void;
  onStopListen: () => void;
}

const CLOSING_PHRASES = [
  "that's all",
  'that is all',
  'thanks',
  'thank you',
  'done',
  'nothing else',
  'good night',
  'bye',
  'stop',
];

export class ExpenseConversationManager {
  private state: ConversationState = 'IDLE';
  private turnCount: number = 0;
  private maxTurns: number = 3;
  private messages: ExpenseMessage[] = [];
  private todayTotal: number = 0;
  private silenceTimer: any = null;
  private callbacks: ExpenseConversationCallbacks;
  private context: UserSessionContext = {};

  constructor(callbacks: ExpenseConversationCallbacks, context: UserSessionContext = {}) {
    this.callbacks = callbacks;
    this.context = context;
  }

  public updateContext(context: UserSessionContext) {
    this.context = { ...this.context, ...context };
  }

  public getState(): ConversationState {
    return this.state;
  }

  public getMessages(): ExpenseMessage[] {
    return [...this.messages];
  }

  public getTodayTotal(): number {
    return this.todayTotal;
  }

  /**
   * Handle incoming transcript from STT
   */
  public async handleTranscript(transcript: string) {
    const trimmed = transcript.trim();
    if (!trimmed) return;

    // Add user message to running log
    const userMsg: ExpenseMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };
    this.messages.push(userMsg);
    this.callbacks.onMessagesChange([...this.messages]);

    // Check for closing phrase
    const lower = trimmed.toLowerCase();
    const isClosing = CLOSING_PHRASES.some((phrase) => lower.includes(phrase));

    if (isClosing && this.state === 'ACTIVE_SESSION') {
      const closingResponse = `All set! Today's recorded spending total is ₹${this.todayTotal}. Have a restful evening!`;
      this.addAssistantMessage(closingResponse);
      this.callbacks.onAssistantSpeak(closingResponse);
      this.endSession();
      return;
    }

    // Reset the 8-second silence timer whenever user speaks
    this.resetSilenceTimer();

    // Call the Intent Router through backend
    const routeRes: VoiceRouteResponse = await routeVoiceInput(trimmed, this.context);

    // If intent relates to expense logging or summary, transition to ACTIVE_SESSION
    if (routeRes.intent === 'log_expense' || routeRes.intent === 'get_expense_summary') {
      if (this.state === 'IDLE') {
        this.state = 'ACTIVE_SESSION';
        this.turnCount = 1;
        this.callbacks.onStateChange(this.state);
      } else {
        this.turnCount += 1;
      }

      // Update total if returned
      if (routeRes.data && routeRes.data.today_total_inr !== undefined) {
        this.todayTotal = routeRes.data.today_total_inr;
        this.callbacks.onTotalChange(this.todayTotal);
      } else if (routeRes.data && routeRes.data.total_inr !== undefined) {
        this.todayTotal = routeRes.data.total_inr;
        this.callbacks.onTotalChange(this.todayTotal);
      }

      const assistantMsg = this.addAssistantMessage(
        routeRes.spoken_response,
        routeRes.data?.added_amount,
        routeRes.data?.category
      );

      this.callbacks.onAssistantSpeak(assistantMsg.text);
    } else {
      // Different intent or chit-chat
      const assistantMsg = this.addAssistantMessage(routeRes.spoken_response);
      this.callbacks.onAssistantSpeak(assistantMsg.text);

      if (this.state === 'ACTIVE_SESSION') {
        this.turnCount += 1;
      }
    }
  }

  /**
   * Called by the voice response component when assistant completes speech audio playback.
   * In ACTIVE_SESSION state, automatically re-arms microphone for up to 3 turns!
   */
  public onAssistantFinishedSpeaking() {
    if (this.state === 'ACTIVE_SESSION') {
      if (this.turnCount <= this.maxTurns) {
        // Automatically re-arm voice recording
        this.resetSilenceTimer();
        this.callbacks.onRequestListen();
      } else {
        this.endSession();
      }
    }
  }

  private addAssistantMessage(text: string, amount?: number, category?: string): ExpenseMessage {
    const msg: ExpenseMessage = {
      id: `asst_${Date.now()}`,
      role: 'assistant',
      text,
      timestamp: Date.now(),
      amount_inr: amount,
      category,
    };
    this.messages.push(msg);
    // Keep only last 8 messages for memory efficiency
    if (this.messages.length > 8) {
      this.messages = this.messages.slice(-8);
    }
    this.callbacks.onMessagesChange([...this.messages]);
    return msg;
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }

    // 8-second silence window: auto-returns to IDLE
    this.silenceTimer = setTimeout(() => {
      if (this.state === 'ACTIVE_SESSION') {
        this.endSession();
      }
    }, 8000);
  }

  public endSession() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.state = 'IDLE';
    this.turnCount = 0;
    this.callbacks.onStateChange('IDLE');
    this.callbacks.onStopListen();
  }

  public cleanup() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    this.callbacks.onStopListen();
  }
}
