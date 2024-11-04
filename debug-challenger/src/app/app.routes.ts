import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { PrimmDebugViewComponent } from './primm-debug-view/primm-debug-view.component';

export const routes: Routes = [
    {path:'', component: HomepageComponent},
    {path:'exercise', component: PrimmDebugViewComponent}
];
