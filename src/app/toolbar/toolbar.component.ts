import { Component, Input } from '@angular/core';

import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmNavDialogComponent } from './confirm-nav-dialog/confirm-nav-dialog.component';
import { Router } from '@angular/router';
import { PageToNavigate } from '../types/types';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [MatIconModule, MatToolbarModule, MatButtonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.sass'
})
export class ToolbarComponent {

  constructor(private router: Router, private dialog: MatDialog) { }

  @Input() enableToHomeNavigation: boolean = true;

  @Input() displayToHomeDialog: boolean = false; //Whether a dialog should be displayed when navigating back to the homepage/challenge dashboard

  toHomepage() {
    if (this.displayToHomeDialog) { 
      this.openToHomeDialog();
    }
    else {
      let route: string = '/';
      this.router.navigate([route]);
    }
  }

  openToHomeDialog() {
    const dialogRef = this.dialog.open(ConfirmNavDialogComponent, {
      data: {
        title: "Are you sure?",
        content: "Are you sure you want to go to the homepage? All your progress will be lost!",
        pageToNavigate: PageToNavigate.homepage
      },
    });
  }
}
