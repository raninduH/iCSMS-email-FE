import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthenticationService } from '../../../auth/services/authentication.service';
import { TokenStorageService } from "../../shared-services/token-storage.service";

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ["./sidenav.component.scss"]
})
export class SidenavComponent implements OnInit {
  menuItems: MenuItem[] = [];
  logoutItems: MenuItem[] = [];
  permissions: string[] = [];

  constructor(private authService: AuthenticationService, private tokenStorageService: TokenStorageService) {}

  ngOnInit() {
    let permissions = this.tokenStorageService.getStorageKeyValue("permissions");
    console.log('permissions:', permissions)
    this.logoutItems = [
      {
        label: "Logout",
        icon: "pi pi-fw pi-external-link",
        routerLink: "auth/signout",
      }
    ];

    this.menuItems = [

      {
        label: 'Email Analytics',
        icon: 'pi pi-fw pi-envelope',
        items: [

          {
            label: 'Dashboard',
            routerLink: "email/dashboard2",
            icon: 'pi pi-fw pi-th-large'
          },
          {
            label: 'Email Issues',
            routerLink: "email/issues",
            icon: 'pi pi-fw pi-flag'
          },
          {
            label: 'Email Inquiries',
            routerLink: "email/inquiries",
            icon: 'pi pi-fw pi-question'
          },
          {
            label: 'Email Suggestions',
            routerLink: "email/suggestions",
            icon: 'pi pi-fw pi-bolt',
          },
          {
            label: 'Thread Summaries',
            routerLink: "email/summaries",
            icon: 'pi pi-fw pi-link'
          },
          {
            label: 'Settings',
            routerLink: "email/settings",
            icon: 'pi pi-fw pi-sliders-h'
          }
        ]
      }

    ];

    this.authService.permissions$.subscribe(permissions => {
      this.permissions = permissions;
      this.updateMenuItems();
    });
  }

  getVisibility(route: string) {
    if (route === 'app-settings/users') {
      return this.permissions.includes('View Users');
    } else if (route === 'app-settings/role-management') {
      return this.permissions.includes('View Roles');
    } else if(route == 'app-settings/configurations'){
      return this.permissions.includes('View Config');
    }else{
      return true
    }
  }

  updateMenuItems() {
    this.menuItems.forEach(menuItem => {
      if (menuItem.items) {
        menuItem.items.forEach(subMenuItem => {
          subMenuItem.disabled = !this.getVisibility(subMenuItem.routerLink);
        });
      } else {
        menuItem.disabled = !this.getVisibility(menuItem.routerLink);
      }
    });
  }
}

