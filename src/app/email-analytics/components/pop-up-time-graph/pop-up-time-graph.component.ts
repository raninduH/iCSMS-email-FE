import { Component, Input, SimpleChanges } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { UtilityService } from '../../services/utility.service';
import { Subscription } from 'rxjs';
import { OverdueIssuesResponse, TimeCardResponse, TimeGraph } from '../../interfaces/dashboard';
import { DataService } from '../../services/dashboardMain.service';


@Component({
  selector: 'app-pop-up-time-graph',
  templateUrl: './pop-up-time-graph.component.html',
  styleUrl: './pop-up-time-graph.component.scss'
})
export class PopUpTimeGraphComponent {
  breadcrumbItems: MenuItem[] = [
    {label: "Email Analytics"},
    {label: "Dashboard"},
    {label:"Time Analytics"}
  ];

  @Input() intervalInDaysStart!: number;
  @Input() intervalInDaysEnd!: number;
  @Input() isOpened!:boolean;

  rangeDates: Date[] | undefined;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  minDate: Date = new Date();
  maxDate: Date = new Date();

  isLoadingResponseTime: boolean = false;
  isLoadingResolutionTime: boolean = false;
  isLoadingOverdue: boolean = false;
  resolutionTimesY: number[] = [];
  responseTimesY: number[] = [];
  resolutionTimesX: string[] = [];
  responseTimesX: string[] = [];
  overdueCount: number = 0;

  private ResponseTimeSubscription: Subscription | undefined;
  private ResolutionTimeSubscription: Subscription | undefined;
  private OverdueIssuesdataSubscription: Subscription | undefined;


  constructor(
    private utilityService: UtilityService, 
    private dataService: DataService,
  ) { }

  ngOnInit() {
    // calendar configuration
    let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = (month === 0) ? 11 : month -1;
    let prevYear = year;
    this.minDate = new Date();
    this.minDate.setMonth(prevMonth);
    this.minDate.setFullYear(prevYear);
    this.maxDate = today;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['intervalInDaysStart'] || changes['intervalInDaysEnd']) && this.isOpened) {
      this.unsubscribeAll();
      this.subscribeALL();
    }

    if(changes['isOpened']){

      if(this.isOpened){
        this.subscribeALL();
      }else{
        this.unsubscribeAll();
      }
    }
  }
  ngOnDestroy(): void {
    this.unsubscribeAll()
  }
  onRangeDatesChanged(rangeDates: Date[]) {
    const endDate = rangeDates[1];
    const startDate = rangeDates[0];
    const today = new Date();
  
    // Ensure dates are in the same time zone for correct comparison
    const startDateMidnight = new Date(startDate.setHours(0, 0, 0, 0));
    const endDateMidnight = new Date(endDate.setHours(0, 0, 0, 0));
    const todayMidnight = new Date(today.setHours(0, 0, 0, 0));
  
    // Calculate the difference in milliseconds
    const differenceStartMs = todayMidnight.getTime() - startDateMidnight.getTime();
    const differenceEndMs = todayMidnight.getTime() - endDateMidnight.getTime();
  
    // Calculate the difference in days
    this.intervalInDaysStart = Math.floor(differenceStartMs / (1000 * 60 * 60 * 24))
    this.intervalInDaysEnd = Math.floor(differenceEndMs / (1000 * 60 * 60 * 24))
      
    this.unsubscribeAll()
    this.subscribeALL();
  }
  subscribeALL(){
    this.getDataForFirstResponseTime()
    this.getDataForResolutionTime()
    this.getOverdueIssuesdata()
  }
  unsubscribeAll() {
    this.OverdueIssuesdataSubscription?.unsubscribe();
    this.ResponseTimeSubscription?.unsubscribe();
    this.ResolutionTimeSubscription?.unsubscribe();
  }
  getDataForFirstResponseTime(){
    this.isLoadingResponseTime = true;
    this.ResponseTimeSubscription = this.dataService
      .getFirstResponseTime(this.intervalInDaysStart, this.intervalInDaysEnd)
      .subscribe((data: TimeGraph) => {
        this.responseTimesY = data.y;
        this.responseTimesX = data.x;
        this.isLoadingResponseTime = false;
      });
  }
  getDataForResolutionTime(){
    this.isLoadingResolutionTime = true;
    this.ResolutionTimeSubscription = this.dataService
      .getResolutionTime(this.intervalInDaysStart, this.intervalInDaysEnd)
      .subscribe((data: TimeGraph) => {
        this.resolutionTimesY = data.y;
        this.resolutionTimesX = data.x;
        this.isLoadingResolutionTime = false;
      });
  }
  getOverdueIssuesdata(){
    this.isLoadingOverdue = true;
    this.OverdueIssuesdataSubscription = this.dataService
      .getOverdueIssuesdata(this.intervalInDaysStart, this.intervalInDaysEnd)
      .subscribe((data: OverdueIssuesResponse) => {
        this.overdueCount = data.sum_overdue_issues;
        this.isLoadingOverdue = false;
      });
  }
}
