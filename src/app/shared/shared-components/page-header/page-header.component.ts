import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from "primeng/api";
import { DateRangeService } from '../../../main-dashboard/services/shared-date-range/date-range.service';
import { TokenStorageService } from "../../shared-services/token-storage.service";

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit {

  @Input() pageTitle!: string;
  @Input() showDatePicker: boolean = false;
  @Input() showButton: boolean = false;
  @Input() buttonText: string = "";
  @Input() breadcrumbItems: MenuItem[] = [];
  @Input() showAddMemberButton: boolean = false;
  @Input() showAddWidgetButton: boolean = false;
  @Input() showAddRoleButton: boolean = false;
  @Input() showRightSideBarButtons: boolean = false;
  @Input() mainDashboardDate: boolean = false;
  @Input() callDashboardDate: boolean = false;

  @Input() mainDashboardNotification: boolean = false;

  @Input() emailDashboardDate:boolean=false;
  @Input() intervalInDaysStart:number=29;
  @Input() intervalInDaysEnd:number=0;

  @Input() minDate: Date = new Date();
  @Input() maxDate: Date = new Date();

  @Output() buttonAction: EventEmitter<any> = new EventEmitter();
  @Output() rangeDatesChanged: EventEmitter<Date[]> = new EventEmitter<Date[]>();
  @Output() callDateRangeChanged: EventEmitter<string[]> = new EventEmitter<string[]>();

  sidebarVisible: boolean = false;

  rangeDates: Date[] | undefined;
  callDateRange: Date[] | undefined;
  emailDates: Date[] | undefined;
  home: MenuItem | undefined;
  isAbleToAddCall: boolean = false;
  isAbleToAddOperator: boolean = false;

  constructor(
    private router: Router,
    private dateRangeService: DateRangeService,
    private tokenStorageService: TokenStorageService
  ) {
  }

  ngOnInit() {
    // get last month date
    this.callDateRange = [
      new Date(),
      new Date(new Date().setMonth(new Date().getMonth() - 1))
    ]
    this.rangeDates = this.getCurrentDateRange();
    this.emailDates = this.getEmailCurrentDateRange();
    this.dateRangeService.changeDateRange(this.rangeDates);
    this.home = {icon: 'pi pi-home', routerLink: '/'};
    this.showOldDate();
    let permissions = this.tokenStorageService.getStorageKeyValue("permissions");
    this.isAbleToAddCall = permissions.includes("Add Call Recording");
    this.isAbleToAddOperator = permissions.includes("Add Call Operator");
  }

  onRangeDateChange(rangeDates: Date[]) {
    this.rangeDatesChanged.emit(rangeDates);
    console.log('rangeDates', rangeDates);
  }

  onRangeSelect(dateRange: Date[]) {
    if (dateRange[1] !== null) {
      this.callDateRangeChanged.emit([this.formatDate(dateRange[0], "start"), this.formatDate(dateRange[1], "end")]);
      console.log(this.formatDate(dateRange[0]), this.formatDate(dateRange[1]))
    }
  }

  formatDate(date: Date, type: "start" | "end" = "start"): string {
    const pad = (num: any) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // getMonth() is zero-indexed
    const day = pad(date.getDate());
    if (type === "start") {
      return `${year}-${month}-${day}-00-00-00`;
    } else {
      return `${year}-${month}-${day}-23-59-59`;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['intervalInDaysStart'] || changes['intervalInDaysEnd']) {
      this.emailDates = this.getEmailCurrentDateRange();
    }
  }

  getCurrentDateRange = (): Date[] => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 7);
  
    return [pastDate, today];
  };



  getEmailCurrentDateRange = (): Date[] => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - this.intervalInDaysStart);
    today.setDate(today.getDate() - this.intervalInDaysEnd)
  
    return [pastDate, today];
  };

  onClickActionButton(): void {
    this.buttonAction.emit();
  }

  addCallRecordings() {
    this.router.navigate(['/call/upload']);
  }

  addMember() {
    this.router.navigate(['/members/add']);
  }

  onDateRangeChange(): void {
    if (this.rangeDates) {
      this.dateRangeService.changeDateRange(this.rangeDates);
      this.oldDateSave(this.rangeDates);
    }
  }

  onDateRangeChangeNotifications(): void {
    if (this.rangeDates) {
      this.dateRangeService.changeDateRange(this.rangeDates);
      // this.oldDateSave(this.rangeDates);
    }
  }

  oldDateSave(dateRange: Date[]): void {
    caches.open('all-data').then(cache => {
      const dateStrings = dateRange.map(date => date.toISOString());
      const dataResponse = new Response(JSON.stringify(dateStrings), {
        headers: {'Content-Type': 'application/json'}
      });
      cache.put('old-date', dataResponse);
    });
  }

  showOldDate(): void {
    caches.open('all-data').then(cache => {
      cache.match('old-date').then(cachedResponse => {
        if (cachedResponse) {
          cachedResponse.json().then((data: string[]) => {
            this.rangeDates = data.map(dateString => new Date(dateString));
            this.dateRangeService.changeDateRange(this.rangeDates);
          });
        } else {
          // console.log('Data not found in cache');
        }
      });
    });
  }
}
