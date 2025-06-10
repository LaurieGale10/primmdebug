import { Component, Input } from '@angular/core';

import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { ToHomeDialogComponent } from './to-home-dialog/to-home-dialog.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.sass'
})
export class ToolbarComponent {

  constructor(private dialog: MatDialog) { }

  @Input() displayHomeButton: boolean = false;

  openToHomeDialog() {
    const dialogRef = this.dialog.open(ToHomeDialogComponent, {
      data: {
        title: "Are you sure?",
        content: "Are you sure you want to go back? All your progress on this exercise will be lost!"
      }
    });
  }
}
