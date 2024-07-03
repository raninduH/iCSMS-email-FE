import { Component, OnInit, ViewChild } from '@angular/core';
import { SortEvent } from 'primeng/api';
import { Campaign, CampaignData } from '../../models/campaign-analysis';
import { SettingsApiService } from '../../services/settings-api.service';
import { ModalCampaignComponent } from '../../components/Modals/modal-campaign/modal-campaign.component';

@Component({
  selector: 'settings-campaign',
  templateUrl: './settings-campaign.component.html',
  styleUrls: ['./settings-campaign.component.scss']
})


export class SettingsCampaignComponent implements OnInit {

  tabFacebook = { title: 'Facebook', img: 'assets/social-media/icons/facebook.png' };
  tabInstagram = { title: 'Instagram', img: 'assets/social-media/icons/instargram.png' };

  contentFacebook: CampaignData = { subtitle: 'Facebook', data: [] };
  contentInstagram: CampaignData = { subtitle: 'Instagram', data: [] };

  @ViewChild(ModalCampaignComponent) modalCampaignComponent!: ModalCampaignComponent;

  constructor(private settingsApiService: SettingsApiService) { }

  ngOnInit(): void {
    this.fetchCampaignsBySM();
  }

  fetchCampaignsBySM(): void {
    this.settingsApiService.getCampaigns().subscribe(
      (response: Campaign[]) => {

        const FacebookData = response["SM01" as keyof typeof response] as Campaign[];
        FacebookData.forEach((item: any) => {
          if (item.description.length > 40) {
            item.description = item.description.slice(0, 40) + '...';
          }
        });
        this.contentFacebook.data = FacebookData;

        const InstagramData = response["SM02" as keyof typeof response] as Campaign[];
        InstagramData.forEach((item: any) => {
          if (item.description.length > 40) {
            item.description = item.description.slice(0, 40) + '...';
          }
        });
        this.contentInstagram.data = InstagramData;

      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  openAddNew(){
    this.modalCampaignComponent.showDialog();
  }

  onRowDelete(item: Campaign): void {
    // Implement delete functionality
  }

  topBarCaption = 'Add New';
}
