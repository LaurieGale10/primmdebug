import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { LoggingService } from '../../services/logging.service';
import { PageToNavigate } from '../../types/types';

export interface DialogData {
  title: string,
  content: string
  pageToNavigate: PageToNavigate
}

@Component({
  selector: 'app-confirm-nav-dialog',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatDialogTitle, MatDialogClose, MatButton],
  templateUrl: './confirm-nav-dialog.component.html',
  styleUrl: './confirm-nav-dialog.component.sass'
})
export class ConfirmNavDialogComponent {
  
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private router: Router, private loggingService: LoggingService) {}

  navigateToPage(): void {
    let route: string = this.data.pageToNavigate == PageToNavigate.homepage ? '/' : '/dashboard';
    this.router.navigate([route]);
  }
}
