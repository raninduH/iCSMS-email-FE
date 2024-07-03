import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from "primeng/api";
import { Content } from '../../models/main-types';
import { TabStateService } from '../../services/tab-state.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class settingsComponent implements OnInit, OnDestroy {
  breadcrumbItems: MenuItem[] = [
    { label: "Social Media Analytics" },
    { label: "Settings" }
  ];

  private subscription: Subscription = new Subscription();

  constructor(
    private tabStateService: TabStateService,
    private route: ActivatedRoute
  ) { }

  tabNotifications = { title: 'Notifications', img: '' };
  tabThresholds = { title: 'Thresholds', img: '' };
  tabAlerts = { title: 'Alerts', img: '' };
  tabCampaigns = { title: 'Campaigns', img: '' };

  content1: Content = { title: 'Notification Configuration' };
  content2: Content = { title: 'Created Thresholds' };
  content3: Content = { title: 'Created Alerts' };
  content4: Content = { title: 'Created Campaigns' };

  topBarCaption = "Export Data";

  ngOnInit(): void {
    this.subscription = this.route.queryParams.subscribe(params => {
      const tabName = params['tab'];
      if (tabName) {
        this.tabStateService.setActiveTab(tabName);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
