import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toaster-message',
  standalone: true,
  imports: [],
  templateUrl: './toaster-message.component.html',
  styleUrl: './toaster-message.component.css'
})
export class ToasterMessageComponent {
  @Input() message: string = '';
  @Input() actionType: number = 0;
  // @Output() closeToasterMessage = new EventEmitter<boolean>();
  isSuccess: boolean = false;
  isFail: boolean = false;
  isInfo: boolean = false;
  isWarning: boolean = false;

  ngOnInit(){
    if(this.actionType == 1){
      this.isSuccess = true;
    }
    if(this.actionType == 2){
      this.isFail = true;
    }
    if(this.actionType == 3){
      this.isInfo = true;
    }
    if(this.actionType == 4){
      this.isWarning = true;
    }
  }

  closeToasterMessage(){
    // this.closeToasterMessage.emit(false);
  }
}
