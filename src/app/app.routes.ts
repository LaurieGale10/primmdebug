import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { ChallengeDashboardComponent } from './challenge-dashboard/challenge-dashboard.component';
import { TeacherInfoComponent } from './teacher-info/teacher-info.component';
import { PrimmDebugViewComponent } from './primm-debug-view/primm-debug-view.component';

export const routes: Routes = [
    {path:'', component: HomepageComponent},
    {path: 'dashboard', component: ChallengeDashboardComponent},
    {path: 'teacher-info', component: TeacherInfoComponent},
    {path:'exercise', component: PrimmDebugViewComponent}
];
