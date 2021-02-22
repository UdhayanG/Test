import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistrationComponent } from './registration/registration.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';
import { LoginComponent } from './login/login.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

const routes: Routes = [
  //{ path: '', component: RegistrationComponent },
  { path: '', component: LandingPageComponent },
  { path: 'Home', component: LandingPageComponent },
  //{ path: '', component: LoginComponent },
  { path: 'About', component: AboutComponent },
  { path: 'Contact', component: ContactComponent },
  { path: 'Registration', component: RegistrationComponent },
  { path: 'Dashboard', component: DashboardComponent },
  { path: 'Privacypolicy', component: PrivacypolicyComponent },
   {path: 'Profile',loadChildren: () => import('./user-profile/user-profile.module').
then(module => module.UserProfileModule)},
 ];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
