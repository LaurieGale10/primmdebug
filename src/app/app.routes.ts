import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ChallengeDashboardComponent } from './challenge-dashboard/challenge-dashboard.component';
import { PrimmDebugViewComponent } from './primm-debug-view/primm-debug-view.component';

export const routes: Routes = [
    {path:'', component: HomepageComponent},
    {path: 'dashboard', component: ChallengeDashboardComponent},
    {path:'exercise', component: PrimmDebugViewComponent}
];
