import { Component,Input} from '@angular/core';
import { DashboardApiService } from '../../../services/dashboard-api.service';

@Component({
  selector: 'line-chart-instagram',
  templateUrl: './line-chart-instagram.component.html',
  styleUrl: './line-chart-instagram.component.scss'
})
export class LineChartInstagramComponent {
  @Input() title!: string;
  data: any;

  options: any;

  constructor(private instagramdataAPiservice:DashboardApiService){}

  ngOnInit() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const startDate = '2024-05-01';
    const endDate = '2024-07-01';

    this.instagramdataAPiservice.getInstagramAnalysisData(startDate, endDate)
      .subscribe(
        (data: any) => {
          console.log(data);
          
          this.data = {
            labels: Object.keys(data['1']),
            datasets: [
              {
                label: 'Reacts',
                data: Object.values(data['1']),
                borderColor: document.documentElement.style.getPropertyValue('--yellow-500'),
              },
              {
                label: 'Comments',
                data: Object.values(data['2']),
                borderColor: document.documentElement.style.getPropertyValue('--pink-500'),
              },
            ]
          };
        },
        error => {
          console.error('Error fetching Facebook Analysis Data:', error);
          // Handle error (e.g., show error message in UI)
        }
      );
   
    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 1.1,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }


}
