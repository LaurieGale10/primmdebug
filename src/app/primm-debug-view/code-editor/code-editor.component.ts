import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, signal, effect, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { trigger, transition } from '@angular/animations';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { v4 as uuidv4 } from "uuid";
import { DebuggingStage } from '../../types/types';
import { expandBorderAnimation } from '../../animations/animations';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './code-editor.component.html',
  styleUrl: './code-editor.component.sass',
  animations: [
    trigger('expandCodeEditorPane', [
      transition('* => '+DebuggingStage.run, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.inspectCode, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.fixError, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.test, [expandBorderAnimation])
    ])
  ]
})
export class CodeEditorComponent implements AfterViewInit {

  @Input({required: true}) program: string | null = null;

  @Input({required: true}) debuggingStage: DebuggingStage | null = null;

  @Output() runButtonPressed: EventEmitter<void> = new EventEmitter<void>;

  @Output() logsReceived: EventEmitter<any> = new EventEmitter<any>;

  @Output() codeEditorLoaded: EventEmitter<any> = new EventEmitter<any>;

  @ViewChild('codeEditor')
  iFrame: ElementRef<HTMLIFrameElement> | undefined;

  @ViewChild('ide')
  iFrameContainer: ElementRef<HTMLElement> | undefined;

  targetDomainSource: any | undefined;
  targetDomainOrigin: any | undefined;

  uid: string | undefined;
  iFrameLoading = signal(true);
  iFrameSuccessfullyLoaded = signal(false);

  constructor() {
    effect(() => {
      if (!this.iFrameLoading() && this.iFrameSuccessfullyLoaded()) {
        this.iFrame!.nativeElement.style.display = "block";
        this.codeEditorLoaded.emit();
      }
    });
  }

  ngAfterViewInit(): void {
    window.addEventListener("message", (event) => {
      this.handleReceive(event);
    });
    this.uid = uuidv4();
    this.iFrame!.nativeElement.src = environment.codeEditorBaseUrl + "/#" + this.uid;

    this.iFrame!.nativeElement.onload = () => {
      this.setupFrame();
    };
    setTimeout(() => {
      if (this.iFrameLoading()) {
        this.iFrameLoading.set(false);
        this.iFrameSuccessfullyLoaded.set(false);
      }
    }, 7500)
  }

  sendMessage(obj: any) {
    obj.uid = this.uid;

    //The final clause is being called here. In the working, vanilla JS version, it doesn't seem as if the sendMessage() function is being called at all
    if (this.iFrame?.nativeElement instanceof HTMLIFrameElement) {
        this.iFrame.nativeElement.contentWindow?.postMessage(obj, "*");
    } else if (undefined !== this.targetDomainSource && undefined !== this.targetDomainOrigin) {
        this.targetDomainSource.postMessage(obj, this.targetDomainOrigin);
    } else {
        // This should only happen if undefined foreignDomain and no message is received yet
        console.log("If foreignDomain is undefined, useIFrameMessages can only reply to messages (i.e. can send only after the first message has been received)");
    }
  }

  handleReceive(e: any) {
    if (e.origin === window.origin) return;

    if (!(typeof e.data === 'object' && e.data !== null && !Array.isArray(e.data) && e.data.hasOwnProperty('uid')
        && e.data.uid === this.uid)) {
        return;
    }

    if (e.data.hasOwnProperty('type')) {

        if (!this.targetDomainSource) {
            this.targetDomainSource = e.source;
            this.targetDomainOrigin = e.origin;
        }
        if (this.replyCallback && e.source) {
          const r = this.replyCallback(e.data);
        }
    }
  }

  /**
   * The function that handles any data returned from the code editor.
   * If you return an object, it will be sent to the editor. Return undefined/null/void to not send a reply.
   * @param {*} data Any logs stored tracked by the code editor at the time of the function being called.
   */
  replyCallback(data: any) {
    switch (data.type) {
        case "confirmInitialised":
          this.iFrameLoading.set(false);
          this.iFrameSuccessfullyLoaded.set(true);
          break;
        case "resize":
          if (typeof data.height === "number") {
            this.iFrameContainer!.nativeElement.setAttribute("style", `height: ${data.height}px`);
          }
          break;
        case "logs":
          this.logsReceived.emit(data)
          break;
        case "toggleRun":
          this.runButtonPressed.emit();
          break;
    }
  }

  setupFrame() {
    if (this.program) {
      this.sendMessage({
        type: "initialise",
        code:  this.program,
        language: "python",
        logChanges: true
    });
    this.sendMessage({
      type: "toggleRun",
      disableRun: true
    });
    this.sendMessage({
      type: "toggleReadOnlyCode",
      readOnlyCode: true
    });
    } else {
      this.iFrameLoading.set(false);
      this.iFrameSuccessfullyLoaded.set(true);
      console.error("The code editor was unable to successfully load the program for the debugging exercise. Please try refreshing.")
    }
  }

}
