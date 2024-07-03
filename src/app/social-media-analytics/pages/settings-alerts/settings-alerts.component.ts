import { Component, OnInit, ViewChild } from '@angular/core';
import { SettingAlertsData, AlertItem } from '../../models/settings';
import { SettingsApiService } from '../../services/settings-api.service';
import { ModalAlertComponent } from '../../components/Modals/modal-alert/modal-alert.component';

@Component({
  selector: 'settings-alerts',
  templateUrl: './settings-alerts.component.html',
  styleUrls: ['./settings-alerts.component.scss']
})

export class SettingsAlerts implements OnInit {
  list_alerts: AlertItem[] = [];

  @ViewChild(ModalAlertComponent) modalAlertComponent!: ModalAlertComponent;

  constructor(private settingsApiService: SettingsApiService) { }

  ngOnInit() {
    this.settingsApiService.getTopicAlerts().subscribe(
      (response: AlertItem[]) => {
        this.list_alerts = response;
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  openAddNew(){
    this.modalAlertComponent.showDialog();
  }

  onRowEdit(item: AlertItem): void {
    this.modalAlertComponent.showDialog(item);
  }

  onRowDelete(item: AlertItem): void {
    // this.settingsApiService.deleteThreshold(item.id).subscribe(() => {
    //   this.thresholds = this.thresholds.filter((val: Thresholds) => val.id !== item.id);
    // });
  }

  topBarCaption = "Add New";
}
