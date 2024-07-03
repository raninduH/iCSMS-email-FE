import { Component, OnInit, ViewChild } from '@angular/core';
import { Thresholds } from '../../models/settings';
import { SettingsApiService } from '../../services/settings-api.service';
import { ModalThresholdComponent } from '../../components/Modals/modal-threshold/modal-threshold.component';


@Component({
  selector: 'settings-thresholds',
  templateUrl: './settings-thresholds.component.html',
  styleUrls: ['./settings-thresholds.component.scss']
})

export class SettingsThresholdsComponent implements OnInit {
  topBarCaption: string = "Add New";
  list_thresholds: Thresholds[] = [];
  thresholds!: Thresholds[];
  loading: boolean = true;

  @ViewChild(ModalThresholdComponent) modalThresholdComponent!: ModalThresholdComponent;

  constructor(private settingsApiService: SettingsApiService) { }

  ngOnInit() {
    this.settingsApiService.getSentimentShift().subscribe(response => {
      const list_thresholds = response as Thresholds[];
      list_thresholds.forEach((item: any) => {
        if (item.sm_id === 'SM01') {
          item.platform = "Facebook";
        } else {
          item.platform = "Instagram";
        }
      });
      this.thresholds = list_thresholds;
      this.loading = false;
    });
  }

  openAddNew(){
    this.modalThresholdComponent.showDialog();
  }

  onRowEdit(item: Thresholds): void {
    this.modalThresholdComponent.showDialog(item);
  }

  onRowDelete(item: Thresholds): void {
    // this.settingsApiService.deleteThreshold(item.id).subscribe(() => {
    //   this.thresholds = this.thresholds.filter((val: Thresholds) => val.id !== item.id);
    // });
  }

}
