import { Routes } from '@angular/router';
import { AuthComponent } from '../pages/auth/auth.component';
import { PageNotFoundComponent } from '../pages/page-not-found/page-not-found.component';
import { MainAppComponent } from '../pages/main-app/main-app.component';
import { ChatPageComponent } from '../pages/chat-page/chat-page.component';
import { ProfilePageComponent } from '../pages/profile-page/profile-page.component';
import { SettingPageComponent } from '../pages/setting-page/setting-page.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'app', component: MainAppComponent, children: [
        {path: 'chat', component: ChatPageComponent},
        {path: 'profile', component: ProfilePageComponent},
        {path: 'setting', component: SettingPageComponent}
    ]},
    {path: 'login', component: AuthComponent},
    {path: '**', component: PageNotFoundComponent}
];
