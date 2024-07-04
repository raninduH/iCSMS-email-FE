import { Component,OnInit} from '@angular/core';
import { MenuItem } from "primeng/api";
import {ComparisonInsightComponent} from '../../components/Modals/comparison-insight/comparison-insight.component';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
 
  breadcrumbItems: MenuItem[] = [
    {label: "Social Media Analytics"},
    {label: "Dashboard"}
  ];

  myData1 = [
  ]

  myData2 = [
  ]

  data_doughnut: number[] = [100, 50, 100];
 
  DateChanged(start: string, end: string) {

  }
}
