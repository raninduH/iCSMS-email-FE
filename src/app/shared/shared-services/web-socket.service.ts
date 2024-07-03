import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { EMPTY, Subject } from 'rxjs';
import { catchError, tap, switchAll } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any> | undefined;
  private messagesSubject$ = new Subject<any>();
  public messages$ = this.messagesSubject$.pipe(switchAll(), catchError(e => { throw e }));

  public connect(url: string): void {
debugger;
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = this.getNewWebSocket(url);
      const messages = this.socket$.pipe(
        tap({
          error: error => console.log(error),
        }), catchError(_ => EMPTY));
      this.messagesSubject$.next(messages);
    }
  }

  private getNewWebSocket(url: string) {
    return webSocket(url);
  }
  sendMessage(msg: any) {
    if (this.socket$) {
      this.socket$.next(msg);
    }
  }
  close() {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
