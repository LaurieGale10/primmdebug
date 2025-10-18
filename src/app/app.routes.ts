import { Routes } from '@angular/router';
import { ChallengeDashboardComponent } from './homepage/challenge-dashboard.component';
import { PrimmDebugViewComponent } from './primm-debug-view/primm-debug-view.component';

export const routes: Routes = [
    {path:'', component: ChallengeDashboardComponent},
    {path:'exercise', component: PrimmDebugViewComponent}
];
