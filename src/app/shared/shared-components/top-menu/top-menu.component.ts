import { Component, OnInit } from '@angular/core';
import { timer } from 'rxjs';
// import { NotificationCountService } from './notification-count-service/notification-count.service';
import { NotificationCountService } from '../../shared-services/notification-count.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../main-dashboard/services/notification.service';
import { AuthenticationService } from '../../../auth/services/authentication.service';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss']
})
export class TopMenuComponent implements OnInit {
  notificationCount: number = 0;

  private socketSubscription: Subscription | undefined;
  constructor(private notificationService: NotificationService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.authService.getIdToken().subscribe((token) =>{
      this.notificationService.getNotificationsCounts(token).subscribe(
        (notifications) => {
          this.notificationCount = notifications;
        },
      );
    });

    // timer(0, 1000).subscribe(() => {
    //   // this.notificationService.getNotificationsCounts().subscribe(
    //   //   (notifications) => {
    //   //     this.notificationCount = notifications;
    //   //   },
    //   // );
    // });

    this.socketSubscription = this.notificationService.messages$.subscribe(
      message => {
        this.authService.getIdToken().subscribe((token) =>{
        this.notificationService.getNotificationsCounts(token).subscribe(
          (notifications) => {
            this.notificationCount = notifications;
          },
        );
      });
      }
      );

  }


}
