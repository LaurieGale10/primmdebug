import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';


export interface DialogData {
  title: string,
  content: string
}

@Component({
  selector: 'app-to-home-dialog',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatDialogTitle, MatDialogClose, MatButton],
  templateUrl: './to-home-dialog.component.html',
  styleUrl: './to-home-dialog.component.sass'
})
export class ToHomeDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData, private router: Router) {}

  returnToHomepage(): void {
    let route = '';
    this.router.navigate([route]);
    //Save stage log and update exercise log here
  }
}
