import {  Component, Input, OnInit,EventEmitter, OnChanges, SimpleChanges,Output,ViewChild } from '@angular/core';
import { DateRangeService } from '../../../services/shared-date-range/date-range.service';
import { ChartsService } from '../../../services/charts.service';
import { timer } from 'rxjs';
import { AuthenticationService } from '../../../../auth/services/authentication.service';
import {MenuItem, MenuItemCommandEvent} from "primeng/api";
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrl: './bar-chart.component.scss'
})
export class BarChartComponent  implements OnInit,OnChanges{

  @ViewChild('op') overlayPanel!: OverlayPanel;
  @Output() sliderInteraction: EventEmitter<boolean> = new EventEmitter();
  @Output() deletedConfirmed: EventEmitter<void> = new EventEmitter<void>();
  @Output() hideConfirmed: EventEmitter<void> = new EventEmitter<void>();

  @Input() closable:boolean = true;

  @Input() id!:string;

  visible:boolean =false;

  data:any;
  @Input() persentages: any[]=[];
  @Input() persentages1: any[]=[];
  @Input() persentages2: any[]=[];
  @Input() persentages3: any[]=[];

  positiveMin:number=2;
  positiveMax:number=100;
  negativeMin:number=2;
  negativeMax:number=100;
  neutralMin:number=2;
  neutralMax:number=100;

  options: any;
  @Output() changesEvent = new EventEmitter<boolean>();

  @Input() topics: string[] = [];
  @Input() sources: string[] = ['call', 'email', 'social'];

  labels: string[] = [];
  total: number = 0;

  datasets:any[]=[];

  positiveData:any[]=[];
  neutralData:any[]=[];
  negativeData:any[]=[];

  callCount: string[] = [];
  emailCount: string[] = [];
  socialCount: string[] = [];

  allDataTpoic: { [key: string]: { positive: number; negative: number; neutral: number } } = {};
  allData: { [key: string]: { ongoing: number; closed: number} } = {};


  @Input() title!: any;
  @Input() source!: string[];
  @Input() changes:boolean=false;

  selectedCategories:any[]=[];
  categories:string[]=['email','call','social'];

  @Input() yAxis!: any;
  @Input() xAxis!: any;

  selectedDateRange: string[] | undefined;
  Date:any;

  chartCategory:string='topic';

  constructor(private dateRangeService: DateRangeService,private chartService: ChartsService,
    private authService:AuthenticationService,
    
  )
  {

  }

  items:MenuItem[] = [];

//   currentChunkIndex = 0;
// chunks = [];

  ngOnInit() {

    this.items= [
      {
        icon: 'pi pi-ellipsis-v',
        items: [
          {
            label: 'Delete',
            icon: 'pi pi-times',
            command: () => {
              this['onDelete']();
            }
          },
          {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
              this['onEdit']();
            }
          },
          {
            label: 'Hide',
            icon: 'pi pi-eye-slash',
            command: () => {
              this['confirmDeleted']();
            }
          }

          
        ]
      }

  ];
    this.categories=this.source;
    this.selectedCategories=this.source;
    
    timer(0,1000).subscribe(() => {
      if(this.changes){
          this.barChartExtract(this.selectedCategories);
        this.changes=false;
      }
    });

    this.dateRangeService.currentDateRange.subscribe(range => {
      if (range && range.length === 2 && range[0] && range[1]) {
        this.selectedDateRange = range.map(date => this.formatDate(date));
        this.Date = null;
        if(this.selectedCategories){

          this.barChartExtract(this.selectedCategories);
        }
      } else if(range && range.length === 2 && range[0]){
        this.selectedDateRange = undefined;
        this.Date = this.formatDate(range[0]);
        if(this.selectedCategories){

          this.barChartExtract(this.selectedCategories);
        }
      }
      else{
        if(this.selectedCategories){

          this.barChartExtract(this.selectedCategories);
        }
      }
    });

    if(this.yAxis=='sources'){
      this.setupChart();
    }
    else{
      this.chart();
    }



  }

  // splitDataIntoChunks(data: any[], chunkSize: number): any[][] {
  //   const chunks = [];
  //   for (let i = 0; i < data.length; i += chunkSize) {
  //     chunks.push(data.slice(i, i + chunkSize));
  //   }
  //   return chunks;
  // }


  onSliderChange(event: any) {
    this.sliderInteraction.emit(true);
  }

  onDelete(){

    this.deletedConfirmed.emit();
  }

edit:boolean=false;

onEdit() {

    this.sliderInteraction.emit(true);
    this.edit = true;

}

editOffApply(){
  this.edit=false;
  this.sliderInteraction.emit(false);
  if(this.selectedCategories){
    this.barChartExtract(this.selectedCategories);
  }
}

editOffCancel(){
  this.edit=false;
  this.sliderInteraction.emit(false);
}

 confirmDeleted() {

        this.hideConfirmed.emit();
  }


onSourceChange(category:any){
    if(this.selectedCategories[0]!=null){
      this.barChartExtract(this.selectedCategories);
    }
    else{
      this.selectedCategories=this.source;
      this.barChartExtract(this.selectedCategories);
    }
  }

ngOnChanges(changes: SimpleChanges) {
    if (changes['changes'] && changes['changes'].currentValue === true) {
      // Defer the method execution until after the view has been checked
      setTimeout(() => {
        this.chartDataGet();
        this.changesEvent.emit(false); // Reset the changes flag to false
      });
    }
  }


chartDataGet(): void {
    this.authService.getIdToken().subscribe((token) =>{
    this.chartService.chartData(token).subscribe(
      (response) => {
        caches.open('all-data').then(cache => {
          cache.match('data').then((cachedResponse) => {
            if (cachedResponse) {
              cachedResponse.json().then((cachedData: any) => {
                // Compare the response with the cached data
                if (!this.isEqual(response, cachedData)) {
                  // Update only the changed data in the cache
                  // const updatedData = { ...cachedData, ...response };
                  const dataResponse = new Response(JSON.stringify(response), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                  cache.put('data', dataResponse);
                  // this.DataCacheChange = true;
                }
              });
            } else {
              // Cache the response if no cached data exists
              const dataResponse = new Response(JSON.stringify(response), {
                headers: { 'Content-Type': 'application/json' }
              });
              cache.put('data', dataResponse);
            }
          });
        });
        this.changes=true;
      },
      // (error) => {
      //   console.error('Error fetching doughnut chart data:', error);
      // }
    );
  });
  }

  isEqual(obj1: any, obj2: any): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        return false;
      }
    }
    return true;
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    const formattedDate = date.toLocaleDateString('en-US', options);
    const parts = formattedDate.split(', ');

    // Format the date to remove the comma and ensure spacing
    const formattedDateString = `${parts[0]} ${parts[1]} ${parts[2]}`;
    return formattedDateString;
  }

  barChartExtract(sources: string[]): void {
    this.datasets = [];
    this.labels = [];
    this.allDataTpoic = {};
    this.allData={};

    caches.open('all-data').then(cache => {
      cache.match('data').then(cachedResponse => {
        if (cachedResponse) {
          cachedResponse.json().then(data => {
            const documentStyle = getComputedStyle(document.documentElement);
            const allTopics: string[] = [];

            sources.forEach(source => {
              let callTopics: any[] = [];
              let emailTopics: any[] = [];

              if (source === 'call') {
                callTopics = this.extractTopics(data, 'call');  
                allTopics.push(...callTopics);
              }

              if (source === 'email') {
                emailTopics = this.extractTopics(data, 'email');
                
                allTopics.push(...emailTopics);
              }

            });

            // Create a set to get distinct topics
            this.topics = [...new Set(allTopics)];

            sources.forEach(source => {
              let sourceData: any[] = [];

              if (source === 'call') {
                this.callCount = this.extractCounts(data, 'call');
                
                sourceData = this.aggregateWordCloudData(this.callCount, this.topics,'call');
              }

              if (source === 'email') {
                this.emailCount = this.extractCounts(data, 'email');
                
                sourceData = this.aggregateWordCloudData(this.emailCount, this.topics,'email');
              }

              if (sourceData && sourceData.length === 3) {
                this.updateAllData(this.transformData(sourceData[0]), 'email');
                this.updateAllData(this.transformData(sourceData[1]), 'call');
                this.updateAllData(this.transformData(sourceData[2]), 'social');
                
              } else if (sourceData && sourceData.length === 2) {
                this.updateAllData(this.transformData(sourceData[0]), 'ongoing');
                this.updateAllData(this.transformData(sourceData[1]), 'closed');
              }
            });

          if (this.xAxis === 'topics' || this.xAxis === 'keywords') {
            const filteredTopicsPositive = this.topics.filter(topic =>
              (this.allDataTpoic[topic]?.positive >= this.positiveMin && this.allDataTpoic[topic]?.positive <= this.positiveMax) || 
              (this.allDataTpoic[topic]?.negative >= this.negativeMin && this.allDataTpoic[topic]?.negative <= this.negativeMax) ||
              (this.allDataTpoic[topic]?.neutral >= this.neutralMin && this.allDataTpoic[topic]?.neutral <= this.neutralMax)
            );
            console.log(this.topics)
            this.topics=filteredTopicsPositive

          }

            this.createDatasets(documentStyle);
            this.getMaxValues(this.datasets);
            this.labels = this.topics; // Update labels based on dynamic topics

            if(this.yAxis=='sources'){
              this.setupChart();
            }
            else{
              this.chart();
            }

          });
        }
      });
    });
  }

maxPositive:any[]=[];
maxNegative:any[]=[];
maxPositiveIndex:any;
maxNegativeIndex :any;

getMaxValues(response: any) {
  this.maxPositive=[];
  this.maxNegative=[];
  const positiveData = response[0].data;
  const negativeData = response[1].data;

  // Sorting positive data
  const sortedPositiveData = [...positiveData].sort((a, b) => b - a);
  // Sorting negative data
  const sortedNegativeData = [...negativeData].sort((a, b) => b - a);

  // Logging sorted positive values and their corresponding indices
  sortedPositiveData.forEach(value => {
    const index = positiveData.indexOf(value);
    this.maxPositive.push(this.labels[index]);
  });

  // Logging sorted negative values and their corresponding indices
  sortedNegativeData.forEach(value => {
    const index = negativeData.indexOf(value);
    this.maxNegative.push(this.labels[index]);
  });
}




transformData(data: any[]): { [key: string]: { count: number, percentage: number } } {
  
  const transformedData: { [key: string]: { count: number, percentage: number } } = {};
  data.forEach(item => {
    transformedData[item.category] = {
      count: item.count,
      percentage: item.percentage
    };
  });
  return transformedData;
}

updateAllData(sourceData: any, sentiment: string): void {
  if (this.yAxis === 'counts') {
    Object.keys(sourceData).forEach(topic => {
      if (!this.allDataTpoic[topic]) {
        this.allDataTpoic[topic] = { positive: 0, negative: 0, neutral: 0 };
      }

      if (sentiment === 'email') {
        this.allDataTpoic[topic].positive += sourceData[topic].count;
      }
      if (sentiment === 'call') {
        this.allDataTpoic[topic].negative += sourceData[topic].count;
      }
      if (sentiment === 'social') {
        this.allDataTpoic[topic].neutral += sourceData[topic].count;
      }
    });

  } else {
    Object.keys(sourceData).forEach(topic => {
      if (!this.allDataTpoic[topic]) {
        this.allDataTpoic[topic] = { positive: 0, negative: 0, neutral: 0 };
      }

      if (sentiment === 'email') {
        this.allDataTpoic[topic].positive += sourceData[topic].count;
      }
      if (sentiment === 'call') {
        this.allDataTpoic[topic].negative += sourceData[topic].count;
      }
      if (sentiment === 'social') {
        this.allDataTpoic[topic].neutral += sourceData[topic].count;
      }
    });
  }

}


createDatasets(documentStyle: CSSStyleDeclaration): void {
  this.datasets = [];
  if (this.yAxis === 'counts') {
  this.datasets.push({
    label: 'Email',
    backgroundColor: documentStyle.getPropertyValue('--positive-color'),
    data: this.topics.map(topic => this.allDataTpoic[topic]?.positive || 0)
  });
  this.datasets.push({
    label: 'Call',
    backgroundColor: documentStyle.getPropertyValue('--negative-color'),
    data: this.topics.map(topic => this.allDataTpoic[topic]?.negative || 0)
  });
  this.datasets.push({
    label: 'Social',
    backgroundColor: documentStyle.getPropertyValue('--neutral-color'),
    data: this.topics.map(topic => this.allDataTpoic[topic]?.neutral || 0)
  });
}
else{
  this.datasets.push({
    label: 'Email',
    backgroundColor: documentStyle.getPropertyValue('--positive-color'),
    data: this.topics.map(topic => this.allDataTpoic[topic]?.positive || 0)
  });
  this.datasets.push({
    label: 'Call',
    backgroundColor: documentStyle.getPropertyValue('--negative-color'),
    data: this.topics.map(topic => this.allDataTpoic[topic]?.negative || 0)
  });
  this.datasets.push({
    label: 'Social',
    backgroundColor: documentStyle.getPropertyValue('--neutral-color'),
    data: this.topics.map(topic => this.allDataTpoic[topic]?.neutral || 0)
  });
}

}

extractTopics(data: any, sourceType: string): any[] {
  return data.flatMap((item: any) =>
    item[sourceType]
      .filter((sourceItem: any) => this.isDateInRange(sourceItem.Date))
      .flatMap((sourceItem: any) => {
        if (this.xAxis === 'topics') {
          return sourceItem.data.flatMap((dataItem: any) => dataItem.topic);
        } else if (this.xAxis === 'keywords') {
          return sourceItem.data.flatMap((dataItem: any) => dataItem.keywords);
        } else if (this.xAxis === 'issues') {
          return sourceItem.data.flatMap((dataItem: any) => dataItem.issue_type);
        } else if (this.xAxis === 'inquiries') {
          return sourceItem.data.flatMap((dataItem: any) => dataItem.inquiry_type);
        } else {
          return [];
        }
      }).filter((element: any) => element != null)
  );
}

extractCounts(data: any, sourceType: string): any[] {
  return data.flatMap((item: any) =>
    item[sourceType]
      .filter((sourceItem: any) => this.isDateInRange(sourceItem.Date))
      .flatMap((sourceItem: any) => sourceItem.data)
      .filter((element: any) => element != null)
  );
}

aggregateWordCloudData(allCount: any, topics: string[],source:string): any[] {

  this.total = 0;

  const categoryMapEmail: { [topic: string]: number } = {};
  const categoryMapCall: { [topic: string]: number } = {};
  const categoryMapSocial: { [topic: string]: number } = {};

  const categoryMapOngoing: { [topic: string]: number } = {};
  const categoryMapClosed: { [topic: string]: number } = {};

  topics.forEach(topic => {
    
    if (this.yAxis === 'counts') {
      categoryMapEmail[topic] = 0;
      categoryMapCall[topic] = 0;
      categoryMapSocial[topic] = 0;
    }
    else {
      categoryMapOngoing[topic] = 0;
      categoryMapClosed[topic] = 0;
    }
    
  });

  allCount.forEach((item: any) => {
    if (item.Sentiment) {
      let itemTopics: any[] = [];

      if (this.xAxis === 'topics') {
        itemTopics = Array.isArray(item.topic) ? item.topic : (item.topic ? [item.topic] : []);
      } else if (this.xAxis === 'inquiries') {
        itemTopics = Array.isArray(item.inquiry_type) ? item.inquiry_type : (item.inquiry_type ? [item.inquiry_type] : []);
      } else if (this.xAxis === 'issues') {
        itemTopics = Array.isArray(item.issue_type) ? item.issue_type : (item.issue_type ? [item.issue_type] : []);
      } else if (this.xAxis === 'keywords') {
        itemTopics = Array.isArray(item.keywords) ? item.keywords : (item.keywords ? [item.keywords] : []);
      }

      if (itemTopics.some((topic: any) => topics.includes(topic))) {
        this.total += 1;

        itemTopics.forEach((topic: string) => {
          if (topics.includes(topic)) {
            if (this.yAxis === 'counts') {
            Object.keys(item.Sentiment).forEach((key) => {

                if (source === 'email') {
                  categoryMapEmail[topic] += 1;
                } else if (source === 'call') {
                  categoryMapCall[topic] += 1;
                } else if (source === 'social') {
                  categoryMapSocial[topic] += 1;
                }});
            }
            else {
                if (item.status.toLowerCase() === 'ongoing') {
                  categoryMapOngoing[topic] += 1;
                } else if (item.status.toLowerCase() === 'closed') {
                  categoryMapClosed[topic] += 1;
                }

              }


          }
        });
      }
    }
  });

  if (this.yAxis === 'counts') {
    const positiveData = topics.map(topic => ({
      category: topic,
      count: categoryMapEmail[topic],
      percentage: parseFloat(((categoryMapEmail[topic] / this.total) * 100).toFixed(2))
    }));

    const negativeData = topics.map(topic => ({
      category: topic,
      count: categoryMapCall[topic],
      percentage: parseFloat(((categoryMapCall[topic] / this.total) * 100).toFixed(2))
    }));

    const neutralData = topics.map(topic => ({
      category: topic,
      count: categoryMapSocial[topic],
      percentage: parseFloat(((categoryMapSocial[topic] / this.total) * 100).toFixed(2))
    }));

    console.log([positiveData, negativeData, neutralData])
    return [positiveData, negativeData, neutralData];
  } else {
    const ongoingData = topics.map(topic => ({
      category: topic,
      count: categoryMapOngoing[topic],
      percentage: parseFloat(((categoryMapOngoing[topic] / this.total) * 100).toFixed(2))
    }));

    const closedData = topics.map(topic => ({
      category: topic,
      count: categoryMapClosed[topic],
      percentage: parseFloat(((categoryMapClosed[topic] / this.total) * 100).toFixed(2))
    }));

    return [ongoingData, closedData];
  }

}


isDateInRange(dateStr: string): boolean {
    if(this.selectedDateRange && this.selectedDateRange.length === 2 && this.selectedDateRange[0] && this.selectedDateRange[1])
      {
        if (!this.selectedDateRange || this.selectedDateRange.length !== 2) {
          return false;
        }
        const date = new Date(dateStr);
        const startDate = new Date(this.selectedDateRange[0]);
        const endDate = new Date(this.selectedDateRange[1]);
        return date >= startDate && date <= endDate;
      }
    else if(this.Date){
      const date = new Date(dateStr);
      const currentDate = new Date(this.Date);
      return date >= currentDate && date <= currentDate;
    }
    else if(!this.selectedDateRange)
      {
        return true;
      }
    return false;

  }


  chart() {
    console.log(this.datasets);
    const documentStyle = getComputedStyle(document.documentElement);
  
    // Define your desired range for labels and datasets
    const labelStartIndex = 0;
    const labelEndIndex = 10;

  
    // Slice the labels and datasets accordingly
    const slicedLabels = this.labels.slice(labelStartIndex, labelEndIndex);
   
    // Assign sliced data to this.data
    this.data = {
      labels: this.labels,
      datasets: this.datasets
    };
  
    // Configure options for the chart
    this.options = {
      indexAxis: 'x',
      maintainAspectRatio: false,
      aspectRatio: 1,
      scales: {
        y: {
          title: {
            display: true,
            text: 'Medium'
          }
        }
      },
      plugins: {
        legend: {
          display: true
        },
        datalabels: {
          anchor: 'end',
          align: 'end',
          formatter: (value: number) => `${value}%`,
          color: '#000',
          font: {
            weight: 'bold',
            size: 12
          }
        }
      },
    };
  }
  
  


setupChart() {
  const labelStartIndex = 0;
  const labelEndIndex = 4;
  const datasetStartIndex = 0;
  const datasetEndIndex = 4;

  this.data = {
    labels: this.labels.slice(labelStartIndex, labelEndIndex),
    datasets: this.datasets.slice(datasetStartIndex, datasetEndIndex)
  };

  this.options = {
    indexAxis: 'x',
    maintainAspectRatio: false,
    aspectRatio: 1,
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    },
    plugins: {
      legend: {
        display: true
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        formatter: (value: number) => `${value}%`,
        color: '#000',
        font: {
          weight: 'bold',
          size: 12
        }
      }
    }
  };
}


}

