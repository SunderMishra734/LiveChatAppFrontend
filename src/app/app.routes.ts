import { Routes } from "@angular/router";
import { AdminComponent } from "../pages/admin/admin.component";
import { AuthComponent } from "../pages/auth/auth.component";
import { ChatPageComponent } from "../pages/chat-page/chat-page.component";
import { MainAppComponent } from "../pages/main-app/main-app.component";
import { PageNotFoundComponent } from "../pages/page-not-found/page-not-found.component";
import { ProfilePageComponent } from "../pages/profile-page/profile-page.component";
import { SettingPageComponent } from "../pages/setting-page/setting-page.component";
import { AdminLoginComponent } from "../shared/components/admin-login/admin-login.component";
import { AdminMainPageComponent } from "../shared/components/admin-main-page/admin-main-page.component";
import { AuthGuard } from "./auth.guard";

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'app', component: MainAppComponent, canActivate: [AuthGuard], children: [
        {path: 'chat', component: ChatPageComponent},
        {path: 'profile', component: ProfilePageComponent},
        {path: 'setting', component: SettingPageComponent}
    ]},
    {path: 'login', component: AuthComponent},
    {path: 'admin', component: AdminComponent, children: [
        {path: 'login', component: AdminLoginComponent},
        {path: 'app', component: AdminMainPageComponent}
    ]},
    {path: '**', component: PageNotFoundComponent}
];
