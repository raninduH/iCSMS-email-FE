import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from "./shared/shared-components/page-not-found/page-not-found.component";
import { UnauthorizedComponent } from "./shared/shared-components/unauthorized/unauthorized.component";

const routes: Routes = [
  {
    path:"auth",
    loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
  },
  {
    path: "email",
    loadChildren: () => import("./email-analytics/email-analytics.module").then(m => m.EmailAnalyticsModule)
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then(m => m.AuthModule)
  },
  {
    path: "unauthorized",
    component: UnauthorizedComponent
  },
 //default path redirect to auth
  {
    path: "",
    redirectTo: "email",
    pathMatch: "full"
  },
  {
    path: "**",
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
