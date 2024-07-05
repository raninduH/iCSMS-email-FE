
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AlertType } from '../../models/settings';
import { SettingsApiService } from '../../services/settings-api.service';

@Component({
  selector: 'settings-notifications',
  templateUrl: './settings-notifications.component.html',
  styleUrls: ['./settings-notifications.component.scss']
})
export class SettingsNotificationsComponent implements OnInit {

  platforms: any[] = [];
  selectedPlatform: any;

  notificationTypes: any[] = [];
  selectedNotificationType: any;

  keywordsChips: string[] = [];
  NotificationChips: string[] = [];

  rangeValues: number[] = [20, 80];
  alertTypes: AlertType[] = [
    { name: 'Email Notification' },
    { name: 'App Notification' }
  ];

  notificationsSettingsFormSentiment: FormGroup;
  notificationsSettingsFormKeywordAlert: FormGroup;
  notificationsSettingsFormChannelConfig: FormGroup;
  selectedAlertType: AlertType | undefined;

  constructor(
    private settingsApiService: SettingsApiService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) { 
    this.notificationsSettingsFormSentiment = this.fb.group({
      platform: ['', Validators.required],
      bellowScore: [{ value: 0, disabled: true }, [Validators.min(-10), Validators.max(10)]],
      aboveScore: [{ value: 0, disabled: true }, [Validators.min(-10), Validators.max(10)]],
      aboveNotify: [false],
      bellowNotify: [false],
      alertType: ['', Validators.required]
    });

    this.notificationsSettingsFormKeywordAlert = this.fb.group({
      platform: ['', Validators.required],
      keywords: [[], Validators.required],
      alertType: ['', Validators.required]
    });

    this.notificationsSettingsFormChannelConfig = this.fb.group({
      dashboardNotifications: [false],
      emailNotifications: [false],
      notificationEmails: [[], Validators.email]
    });
  }

  ngOnInit() {
    this.platforms = [
      { name: 'Facebook', icon: 'assets/social-media/icons/facebook.png' },
      { name: 'Instagram', icon: 'assets/social-media/icons/instargram.png' },
      { name: 'Twitter', icon: 'assets/social-media/icons/twitter.png' },
    ];
    this.notificationTypes = [
      { name: 'Email Notification', icon: 'assets/social-media/icons/email-notification.png' },
      { name: 'APP Notification', icon: 'assets/social-media/icons/APP-notification.png' },
    ];

    this.notificationsSettingsFormSentiment.get('aboveNotify')?.valueChanges.subscribe(checked => {
      if (checked) {
        this.notificationsSettingsFormSentiment.get('aboveScore')?.enable();
      } else {
        this.notificationsSettingsFormSentiment.get('aboveScore')?.disable();
      }
    });

    this.notificationsSettingsFormSentiment.get('bellowNotify')?.valueChanges.subscribe(checked => {
      if (checked) {
        this.notificationsSettingsFormSentiment.get('bellowScore')?.enable();
      } else {
        this.notificationsSettingsFormSentiment.get('bellowScore')?.disable();
      }
    });

    this.loadNotificationSettings();
  }

  loadNotificationSettings(): void {
    this.settingsApiService.getNotificationSettings().subscribe(
      settings => {
        this.notificationsSettingsFormChannelConfig.patchValue({
          dashboardNotifications: settings.dashboard_notifications,
          emailNotifications: settings.email_notifications,
          notificationEmails: settings.notification_emails
        });
      },
      error => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load notification settings.' });
      }
    );
  }

  onSubmitChannelConfig(): void {
    if (this.notificationsSettingsFormChannelConfig.valid) {
        const formData = this.notificationsSettingsFormChannelConfig.value;
        console.log('Submitting form data:', formData);

        // Convert formData to match expected backend structure
        const payload = {
            dashboard_notifications: formData.dashboardNotifications,
            email_notifications: formData.emailNotifications,
            notification_emails: formData.notificationEmails
        };

        this.settingsApiService.updateNotificationSettings(payload).subscribe(
            response => {
                console.log('Update successful:', response);
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Channel config settings saved successfully!' });
            },
            error => {
                console.error('Failed to save channel config settings:', error);
                if (error.status === 422) {
                    this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Invalid data submitted. Please check your input.' });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save channel config settings.' });
                }
            }
        );
    } else {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill out the form correctly.' });
    }
  }
}
