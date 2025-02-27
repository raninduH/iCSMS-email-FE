import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { MenuItem, Message, MessageService } from 'primeng/api';
import { FormControl, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../services/settings.service';
import { AuthenticationService } from '../../../auth/services/authentication.service';
import { DeleteNotiSendingEmail, DeleteReadingEmail, EmailAcc, EmailAccWithNickName, EmailINtegrationPostResponseMessage, GetEditingEmailResponse, GetNewIntergratingEmailID, IssInqType, NotiSendingChannelsRecord, PostEditingEmail, PostNewIntegratingEmail, PostingCriticalityData, IssueInqTypeData, PostingNotiSendingChannelsRecord, PostingOverdueIssuesData, SSShiftData, SendSystemConfigData, UserRoleResponse } from '../../interfaces/settings';
import { forbiddenEmailValidator } from '../../validators/custom-validators';
import { ChangeDetectorRef } from '@angular/core';
import { ToastModule } from 'primeng/toast';





@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  providers: [MessageService]
})
export class SettingsComponent implements OnInit{
  breadcrumbItems: MenuItem[] = [
    {label: "Email Analytics"},
    {label: "Settings"}
  ];

  isChecked: boolean = true;
  checked: boolean = false;
  editEmailAccVisible: boolean = false


  //-------------------------------------------------- arrays---------------------------------------------------------------------------

  isShowingAdminFeatures: boolean = true;

  newlyIntegratingEmailID!: number 
  currentSSCheckingEmailAccountsOfUser = [
    {address: 'uharischandra12@gmail.com'}];
  

  currentCritiCheckingEmailAccountsofUser: EmailAcc[] = [
    { address: 'johndoe@gmail.com'}
  ];

  currentOVerdueCheckingAccountsofUser: EmailAcc[] = [
    { address: 'johndoe@gmail.com'}
  ];
  
  currentConsideringProducts = [{name:'sampleProduct1'}];
  
  currentNotiSendingEmailAccounts = [
    {address:'dummy@gmail.com'}
  ];

  
  currentReadingEmailAccountsForNotificationPage = [{address:'dummy@gmail.com'}];

  currentReadingEmailAccountsForIntegrationPage = [{address:'dummy@gmail.com', nickname:'dummynickname'}];
  
  possibleIssueTypes: IssInqType[] = [{name:'Order Issues'},{name:'Billing and Payment Problems'}, {name:'Account Issues'},
    {name:'Product or Service Complaints'}, {name:'Technical Issues'},{name:'Warranty and Repair Issues'},
    {name:'Subscription Problems'}, {name:'Return and Exchange Problems'}, {name:'Public Relations Issues'}
  ]

  possibleInquiryTypes: IssInqType[] = [{name:'Product Information'},{name:'Pricing and Discounts'}, {name:'Shipping and Delivery'},
    {name:'Warranty and Guarantees'}, {name:'Account Information'},{name:'Technical Support'},
    {name:'Policies and Procedures'}, {name:'Payment Methods'}, {name:'Employment Opportunities'}, {name:'Legal or Compliance'}
  ]
  currentCheckingIssueTypes: IssInqType[] = []
  currentCheckingInquiryTypes: IssInqType[] = []

  
  isVisibleClientSecretValidation: boolean = false
  ClientSecretValidationMessage:string = ""
 
  //-------------------------------------------------- form groups---------------------------------------------------------------------------


  sentimentShiftsForm = this.fb.group({
    emailAccsToCheckSS: new FormControl<EmailAcc[] | null>(this.currentSSCheckingEmailAccountsOfUser, Validators.required),
    lowerSS: 0,
    upperSS: 0,
    lowerNotify: new FormControl<boolean>(false),
    upperNotify: new FormControl<boolean>(false),
    ssThresholdNotiEnabled: [true]
  });

  criticalityForm =this.fb.group({
    emailAccsToCheckCriticality:new FormControl<EmailAcc[] | null>(this.currentCritiCheckingEmailAccountsofUser)
  });

  overdueIssuesForm =this.fb.group({
    emailAccsToCheckOverdueIssues:new FormControl<EmailAcc[] | null>(this.currentOVerdueCheckingAccountsofUser)
  });

  notificationChannelsForm = this.fb.group({
    emailChannelChecked: [false],
    dashboardChannelChecked: [true],
    notiSendingEmails:new FormControl<string[] | null>(null,this.emailArrayValidator() )  //this.emailArrayValidator([])
  });
   
  

  newIntergratingEmailIDMessages: Message[] =[{ severity: 'info', detail: 'Use the following redirect url when setting up the gmail API for the following newly intergrating email account. ' }]
  emailInetgration = this.fb.group({
    newEmailAccount: ['',[Validators.email, Validators.required, forbiddenEmailValidator(this.currentReadingEmailAccountsForIntegrationPage.map(item => item.address))]],
    newEmailNickname:['',[Validators.required], forbiddenEmailValidator(this.currentReadingEmailAccountsForIntegrationPage.map(item => item.nickname))],
    newClientSecret: ['',[Validators.required]]
  });


  emailEdit = this.fb.group({
    newEmailAccount: ['',[Validators.email, Validators.required, forbiddenEmailValidator(this.currentReadingEmailAccountsForIntegrationPage.map(item => item.address))]],
    newEmailNickname:['',[Validators.required], forbiddenEmailValidator(this.currentReadingEmailAccountsForIntegrationPage.map(item => item.nickname))],
    newClientSecret: ['',[Validators.required]]
  });

  systemConfigurations = this.fb.group({
    overdueInterval: 14
  


  });
    
  issueninqyiryTypesConfigurations =this.fb.group({
    issueTypesToCheck:new FormControl<IssInqType[] | null>(this.currentCheckingIssueTypes),
    inquiryTypesToCheck:new FormControl<IssInqType[] | null>(this.currentCheckingInquiryTypes)
  });





  // constructor
  constructor(private fb: FormBuilder, private http: HttpClient, private dataService: DataService, private messageService: MessageService, private authService: AuthenticationService, private cd: ChangeDetectorRef) {}

  
  //-------------------------------------------------- onSubmit functions---------------------------------------------------------------------------

  onSubmitSentimentShifts(): void {

    const email_Accs_To_CheckSS = this.sentimentShiftsForm.value.emailAccsToCheckSS;
    console.log(email_Accs_To_CheckSS);

    let formData: SSShiftData = {
      accs_to_check_ss: email_Accs_To_CheckSS ? email_Accs_To_CheckSS : [],
      ss_lower_bound: email_Accs_To_CheckSS ? this.sentimentShiftsForm.value.lowerSS ?? 0 : 0,
      ss_upper_bound: email_Accs_To_CheckSS ? this.sentimentShiftsForm.value.upperSS ?? 0 : 0,
      is_checking_ss: email_Accs_To_CheckSS ? this.sentimentShiftsForm.value.ssThresholdNotiEnabled ?? false : false,
      is_lower_checking: email_Accs_To_CheckSS ? this.sentimentShiftsForm.value.lowerNotify ?? false : false,
      is_upper_checking: email_Accs_To_CheckSS ? this.sentimentShiftsForm.value.upperNotify ?? false : false
    };

    console.log("sending SSSHIFT FORMDATA", formData)
    this.authService.getIdToken().subscribe((token: any) => {
      this.dataService.postSSShiftData(token, formData).subscribe(response => {
        console.log('Trigger Data sent successfully:', response);
        
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Sentiment shifts configuration updated succesfuly!' });
  
        this.getSentimentShiftDataOfUser()
        this.getNotiChannelsDataForUser()
      }, error => {
        console.error('Error sending data:', error);
        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured' });
      });
    });
  

    } 


  

  onSubmitCriticality(): void {
    const email_Accs_To_Criticality = this.criticalityForm.value.emailAccsToCheckCriticality;

    let formData: PostingCriticalityData = {
      accs_to_check_criticality: email_Accs_To_Criticality ? email_Accs_To_Criticality.map((item: any) => item.address) : [],
    }
    
    console.log("PostingCriticalityData", formData)

    this.authService.getIdToken().subscribe((token: any) => {
      this.dataService.postCriticalityData(token, formData).subscribe(response => {
        console.log('Trigger Data sent successfully:', response);
        
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Criticality checking emails updated succesfuly!' });
  
        this.getCiticalityCheckingDataOfUser()
        this.getNotiChannelsDataForUser()
      }, error => {
        console.error('Error sending data:', error);
        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured' });
      });
    });

  }


  onSubmitOverdueIssues(): void {
    const email_Accs_To_Overdue_Issues = this.overdueIssuesForm.value.emailAccsToCheckOverdueIssues;
    console.log("email_Accs_To_Overdue_Issues",email_Accs_To_Overdue_Issues)
    let formData: PostingOverdueIssuesData = {
      accs_to_check_overdue_emails: email_Accs_To_Overdue_Issues ? email_Accs_To_Overdue_Issues.map((item: any) => item.address) : [],
    }

    this.authService.getIdToken().subscribe((token: any) => {
      this.dataService.postIssuesOverdueData(token, formData).subscribe(response => {
        console.log('Trigger Data sent successfully:', response);
        
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Overdue checking emails updated succesfuly!' });
  
        this.getOverdueIssuesCheckingDataOfUser()
        this.getNotiChannelsDataForUser()

      }, error => {
        console.error('Error sending data:', error);
        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured when updating overdue issue checking emails' });
      });

    });

  }


  //notification channels submit

  onSubmitNotificationChannels(): void {
    //console.log(this.notificationChannelsForm.value);


    const formData: PostingNotiSendingChannelsRecord = {
      is_email_notifications:this.notificationChannelsForm.value.emailChannelChecked || false,
      is_dashboard_notifications: this.notificationChannelsForm.value.dashboardChannelChecked || false,
      noti_sending_emails:this.notificationChannelsForm.value.notiSendingEmails || []
    }
    //console.log(formData.noti_sending_emails.length, formData.is_email_notifications, this.currentNotiSendingEmailAccounts.length)

    if (formData.noti_sending_emails.length===0 && formData.is_email_notifications===true && this.currentNotiSendingEmailAccounts.length===0){
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Please Enter some email addresses to send notifications to' });

    }else{
          this.authService.getIdToken().subscribe((token: any) => {
            this.dataService.postNotificationChannelsData(token, formData).subscribe(response => {
              console.log('Notification channels Data sent successfully:', response);
        
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification channels configuration updated succesfuly!' });
        
        
              this.notificationChannelsForm.reset();
              this.getNotiChannelsDataForUser()
              
            }, error => {
              console.error('Error sending data:', error);
              this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured while sending notification channels data' });
        
            });
          });
    }




    
    }
    
  onSubmitSystemConfigurations(): void {
      //console.log(this.systemConfigurations.value);
  
  
      const formData: SendSystemConfigData = {
        overdue_margin_time:this.systemConfigurations.value.overdueInterval || 14

      }
  
      this.dataService.postSystemConfigData(formData).subscribe(response => {
        console.log('Notification configurations Data sent successfully:', response);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Overdue time updated succesfully!'}); 
        this.getSystemConfigDataForCompany()      
      }, error => {
        this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured' });
        console.error('Error sending data:', error);
      });
  
      
      }

  onSubmitIssueTypes(): void {
  
        const issue_types_to_check = this.issueninqyiryTypesConfigurations.value.issueTypesToCheck;
        const inquiry_types_to_check = this.issueninqyiryTypesConfigurations.value.inquiryTypesToCheck;
        //console.log("issue types to check",issue_types_to_check, "inquiry_types_to_check", inquiry_types_to_check)
        let formData: IssueInqTypeData = {
          issue_types_to_check: issue_types_to_check ? issue_types_to_check.map((item: any) => item.name) : [],
          inquiry_types_to_check: inquiry_types_to_check?inquiry_types_to_check.map((item: any) => item.name) : []
        }
 
     
        this.dataService.postIssInqTypeData(formData).subscribe(response => {
          console.log('Trigger Data sent successfully:', response);
          
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Issue and inquiry types updated succesfuly!' });
    
          this.getIssInqTypeData()
          
  
        }, error => {
          console.error('Error sending data:', error);
          this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured when updating issue and inquiry types' });
        });
    
    
    
      }

  
  onSubmitEmailEdit(): void {
    //console.log(this.emailEdit.value);
    const newEmailName = this.emailEdit.get('newEmailAccount')?.value;
    const newEmailNName = this.emailEdit.get('newEmailNickname')?.value;
    const newEmailClientSecret = this.emailEdit.get('newClientSecret')?.value;


    if (newEmailName && newEmailNName) { 
          
          const sendingData: PostEditingEmail = {
            oldEmailAddress:this.selectedReadingEmail,
            editedEmailAddress: newEmailName,
            nickName: newEmailNName,
            clientSecret: newEmailClientSecret || ""
          }

          //console.log(sendingData)

          // Send the new email data to FastAPI
          this.dataService.postEmailEdit(sendingData).subscribe((response: EmailINtegrationPostResponseMessage) => {
            console.log('Data sent successfully:', response);
            if (response.message == "edit complete"){
              this.editEmailAccVisible = false
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Email info edited succesfuly!' });
              // Assuming you want to reset the form after successful submission
              this.emailEdit.reset();
              this.getReadingEmailAccountsForSettingsPages()
            }else{
              this.ClientSecretValidationMessage = response.message 
              this.isVisibleClientSecretValidation = true
              
            }

          }, error => {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured' });
            console.error('Error sending data:', error);
          });
                
      
  } else {
      console.log("No new topics entered.");
  }
  }   



  onSubmitEmailIntegration(): void {
    //console.log(this.emailInetgration.value);
    const newEmailName = this.emailInetgration.get('newEmailAccount')?.value;
    const newEmailNName = this.emailInetgration.get('newEmailNickname')?.value;
    const newEmailClientSecret = this.emailInetgration.get('newClientSecret')?.value;


    if (newEmailName && newEmailNName) { 
          console.log(newEmailName);
        
          const sendingData: PostNewIntegratingEmail = {
            emailID: this.newlyIntegratingEmailID,
            emailAddress: newEmailName,
            nickName: newEmailNName,
            clientSecret: newEmailClientSecret || ""
          }
          // Send the new email data to FastAPI
          this.dataService.postEmailIntegration(sendingData).subscribe((response: EmailINtegrationPostResponseMessage) => {
            console.log('Data sent successfully:', response);
            if (response.message == "intergration complete"){
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New email integrated succesfuly!' });
              this.emailInetgration.reset();
              this.getReadingEmailAccountsForSettingsPages()
            }else{
              this.ClientSecretValidationMessage = response.message 
              this.isVisibleClientSecretValidation = true
              
            }

          }, error => {
            this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured' });
            console.error('Error sending data:', error);
          });
                
      
  } else {
      console.log("No new topics entered.");
  }
  }

 
 
  //-------------------------------------------------- show dialog functions---------------------------------------------------------------------------

  selectedNotiSendingEmail : any;
  visibleConfirmationNotiSending: boolean = false;
  
  selectedProduct!: string;
  visibleProductDeleting: boolean = false;


  selectedReadingEmail : any;
  visibleConfirmationEmailIntegration: boolean = false;

  showDialogConfirmationNotiSending(emailAddress: any): void {
    this.selectedNotiSendingEmail = emailAddress;
    this.visibleConfirmationNotiSending = true;
  }

  showDialogConfirmationProductDeleting(productname: string): void {
    this.selectedProduct = productname;
    this.visibleProductDeleting = true;
  }

  ConfirmNotiSendingDelete():void{
    this.deleteNotiSendingEmail(this.selectedNotiSendingEmail)
    this.visibleConfirmationNotiSending = false;

  }


  showEmailAccEditPopUp(emailAddress: any): void {
    this.selectedReadingEmail = emailAddress;
    
    this.dataService.getEmailEditData(this.selectedReadingEmail).subscribe((data: GetEditingEmailResponse) => {
  
      //console.log('Data received:', data);
      this.emailEdit.patchValue({
        newClientSecret: data.clientSecret,
        newEmailAccount: data.emailAddress,
        newEmailNickname: data.nickName
      
      });
  
      
    });

    this.editEmailAccVisible = true;

  }

  showDialogConfirmationEmailIntegration(emailAddress: any): void {
    this.selectedReadingEmail = emailAddress;
    this.visibleConfirmationEmailIntegration = true;
  }

  ConfirmReadingEmailDelete():void{
    this.deleteReadingEmail(this.selectedReadingEmail)
    this.visibleConfirmationEmailIntegration = false;

  }
 
  //-------------------------------------------------- delete funcs---------------------------------------------------------------------------


formGroup: FormGroup | undefined;

deleteReadingEmail(email: string): void {
  
  //console.log( this.selectedReadingEmail)

  const sendingData: DeleteReadingEmail = {removing_email:email}

  this.dataService.deleteReadingEmail(sendingData).subscribe(response => {
      console.log('Data sent successfully:', response);

      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Reading email deleted succesfully' });

      this.getReadingEmailAccountsForSettingsPages()
      
    }, error => {
      console.error('Error sending data:', error);
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured' });

    });
}

deleteNotiSendingEmail(emailName: string): void {
  this.currentNotiSendingEmailAccounts = this.currentNotiSendingEmailAccounts.filter(item => item.address !== emailName);

  const sendingData: DeleteNotiSendingEmail = {
       noti_sending_emails: this.currentNotiSendingEmailAccounts.map(item => item.address as string)
  }


  this.authService.getIdToken().subscribe((token: any) => {
    this.dataService.deleteNotiSendingEmail(token, sendingData).subscribe(response => {
      console.log('Data sent successfully:', response);
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Notification sedning email address deletd succesfuly' });
      this.getNotiChannelsDataForUser()
    }, error => {
      console.error('Error sending data:', error);
      this.messageService.add({ severity: 'warn', summary: 'Warn', detail: 'Error occured when deleting notification sending email' });
  
    });
  });


}



//-------------------------------------------------- ngOnInit---------------------------------------------------------------------------

ngOnInit() {

    
    // Set checkbox value
    this.sentimentShiftsForm.controls['lowerNotify'].setValue(false);
    this.sentimentShiftsForm.controls['upperNotify'].setValue(true);

    this.formGroup = new FormGroup({
      values: new FormControl<string[] | null>(null, this.emailArrayValidator()),
      valuesTopics: new FormControl<string[] | null>(null)
    });

    this.notificationChannelsForm.patchValue({
      notiSendingEmails: this.formGroup.get('values')?.value
  });

    
   
  // Check if emailAccsToCheckSS control exists before subscribing to its value changes
  const emailAccsToCheckSSControl = this.sentimentShiftsForm.get('emailAccsToCheckSS');

  if (emailAccsToCheckSSControl) {
    emailAccsToCheckSSControl.valueChanges.subscribe((value: EmailAcc[] | null) => {
      if (!value || value.length === 0) {
        // Disable checkboxes and number inputs when no value is selected
        this.sentimentShiftsForm.controls['lowerNotify'].setValue(false);
        this.sentimentShiftsForm.controls['lowerNotify'].disable();
        this.sentimentShiftsForm.controls['lowerSS'].disable();
        this.sentimentShiftsForm.controls['upperNotify'].setValue(false);
        this.sentimentShiftsForm.controls['upperNotify'].disable();
        this.sentimentShiftsForm.controls['upperSS'].disable();
      } else {
        // Enable checkboxes and number inputs when a value is selected
        this.sentimentShiftsForm.controls['lowerNotify'].enable();
        this.sentimentShiftsForm.controls['lowerSS'].enable();
        this.sentimentShiftsForm.controls['upperNotify'].enable();
        this.sentimentShiftsForm.controls['upperSS'].enable();
      }
    });
    



    this.sentimentShiftsForm.get('ssThresholdNotiEnabled')?.valueChanges.subscribe(value => {
      if (value === false) {
        // Disable checkboxes and number inputs when no value is selected
        this.sentimentShiftsForm.get('emailAccsToCheckSS')?.disable();
        this.sentimentShiftsForm.controls['lowerNotify'].setValue(false);
        this.sentimentShiftsForm.controls['lowerNotify'].disable();
        this.sentimentShiftsForm.controls['lowerSS'].disable();
        this.sentimentShiftsForm.controls['upperNotify'].setValue(false);
        this.sentimentShiftsForm.controls['upperNotify'].disable();
        this.sentimentShiftsForm.controls['upperSS'].disable();
      }else{
        // Enable checkboxes and number inputs when a value is selected
        
        this.sentimentShiftsForm.get('emailAccsToCheckSS')?.enable();
        this.sentimentShiftsForm.controls['lowerNotify'].enable();
        this.sentimentShiftsForm.controls['lowerSS'].enable();
        this.sentimentShiftsForm.controls['upperNotify'].enable();
        this.sentimentShiftsForm.controls['upperSS'].enable();
      }
    });


  }

   this.getUserRoleDataForUser()
  // get reading emails for settings page tabs
  this.getReadingEmailAccountsForSettingsPages()

  // geting sentiment shift checking data for each user
  this.getSentimentShiftDataOfUser()


  // geting criticality checking data for each user
  this.getCiticalityCheckingDataOfUser()
 
    
  // geting overdue issues checking emails for the user
  this.getOverdueIssuesCheckingDataOfUser()


  // geting notification channels data for the user
  this.getNotiChannelsDataForUser()


  // getting system config data for the company
  this.getSystemConfigDataForCompany()

  // getting checking issue types and inquiry types for the company 
  this.getIssInqTypeData()
  
  // getting the email ID for the newly integrating email account
  this.getNewIntergratingEmailID()

 }



 getUserRoleDataForUser(): void {
  this.authService.getIdToken().subscribe((token: string) => {
    this.dataService.getUserRoleData(token).subscribe((data: UserRoleResponse) => {
      //console.log('user role data', data);
      this.isShowingAdminFeatures = data.isAdmin;
    },
    error => {
      console.error('Error fetching user role data:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching user role data.' });
    }
  );
  });
}

getReadingEmailAccountsForSettingsPages(): void {
  
  this.dataService.getData().subscribe(
    (data: EmailAccWithNickName[]) => {
      //console.log("reading email acc data", data);
      this.currentReadingEmailAccountsForIntegrationPage = data; // Array of dictionaries received from the backend
      this.currentReadingEmailAccountsForNotificationPage = data.map(obj => ({ address: obj.address }));
     // console.log('currentReadingEmailAccountsForNotificationPage', this.currentReadingEmailAccountsForNotificationPage);
    },
    error => {
      console.error('Error fetching reading email data:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching reading email data.' });
    }
  );
  

}


getSentimentShiftDataOfUser(): void {

  this.authService.getIdToken().subscribe((token: string) => {
    this.dataService.getSSCheckingData(token).subscribe((data: SSShiftData) => {
      //console.log('sscheckingemails',data)
      this.currentSSCheckingEmailAccountsOfUser = data.accs_to_check_ss
      this.sentimentShiftsForm.patchValue({
        emailAccsToCheckSS: this.currentSSCheckingEmailAccountsOfUser,
        lowerSS:data.ss_lower_bound,
        upperSS:data.ss_upper_bound,
        ssThresholdNotiEnabled:data.is_checking_ss
        
      });
  
      this.sentimentShiftsForm.controls['lowerNotify'].setValue(data.is_lower_checking);
      this.sentimentShiftsForm.controls['upperNotify'].setValue(data.is_upper_checking);
    },
    error => {
      console.error('Error fetching sentiment shifts data:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching current sentiment shifts data.' });
    }
  );
  });

}



getCiticalityCheckingDataOfUser(): void {
  this.authService.getIdToken().subscribe((token: string) => {
    this.dataService.getCriticalityCheckingEmails(token).subscribe((data: EmailAcc[]) => {
      //console.log('Criticality checking emails',data)
      this.currentCritiCheckingEmailAccountsofUser = data
      this.criticalityForm.patchValue({
        emailAccsToCheckCriticality: this.currentCritiCheckingEmailAccountsofUser
      });
    },
    error => {
      console.error('Error fetching criticality checking data:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching criticality checking data.' });
    }
  );
  });
}

getNewIntergratingEmailID(): void{

  this.dataService.getNewIntegratingEmailID().subscribe((data: GetNewIntergratingEmailID) => {
    //console.log('OverdueIssues checking emails',data)
    this.newlyIntegratingEmailID = data.emailID
    let msgDetail = `Use the following redirect url when setting up the gmail API for the following newly intergrating email account \n \n ${this.dataService.baseUrl}=${this.newlyIntegratingEmailID}`
    this.newIntergratingEmailIDMessages = [{ severity: 'info', detail:  msgDetail}]

  },
  error => {
    console.error('Error fetching new intergrating email id', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching new intergrating email id.' });
  }
);
  
}

getOverdueIssuesCheckingDataOfUser(): void{
  this.authService.getIdToken().subscribe((token: string) => {
    this.dataService.getOverdueIssuesCheckingEmails(token).subscribe((data: EmailAcc[]) => {
      //console.log('OverdueIssues checking emails',data)
      this.currentOVerdueCheckingAccountsofUser = data
      this.overdueIssuesForm.patchValue({
        emailAccsToCheckOverdueIssues: this.currentOVerdueCheckingAccountsofUser
      });
    },
    error => {
      console.error('Error fetching overdue issues checking data', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching overdue issues checking emails.' });
    }
  );
  });

}


getNotiChannelsDataForUser(): void {
  this.authService.getIdToken().subscribe((token: string) => {
    this.dataService.getNotiChannelsData(token).subscribe((data: NotiSendingChannelsRecord) => {
      //console.log('NotiChannels DATA',data)
      this.currentNotiSendingEmailAccounts = data.noti_sending_emails
      this.notificationChannelsForm.patchValue({
          emailChannelChecked: data.is_email_notifications,
          dashboardChannelChecked:data.is_dashboard_notifications
      });
    },
    error => {
      console.error('Error fetching notification channels data', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching notification channels data.' });
    }
  );
  });
}


getSystemConfigDataForCompany(): void {
  this.dataService.getSystemConfigurationData().subscribe((data: SendSystemConfigData) => {
    //console.log('System Configurations data ',data)

    this.systemConfigurations.patchValue({
        overdueInterval: data.overdue_margin_time,
    });
  },
  error => {
    console.error('Error fetching system config data', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching system config data.' });
  }
);
}

getIssInqTypeData(): void {
  this.dataService.getIssueInqTypeData().subscribe((data: IssueInqTypeData) => {
    //console.log('Issue inquiry Type Configurations data ',data)
    const issue_types_to_check: IssInqType[] = data.issue_types_to_check.map((item) => {
      return { name: item };
    });
    const inquiry_types_to_check: IssInqType[] = data.inquiry_types_to_check.map((item) => {
      return { name: item };
    });

    this.issueninqyiryTypesConfigurations.patchValue({
        issueTypesToCheck: issue_types_to_check,
        inquiryTypesToCheck: inquiry_types_to_check
    });
  },
  error => {
    console.error('Error fetching system config data', error);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while fetching Issue and inquiry type data.' });
  }
);
}


  emailValidator(email: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(email) ? { 'email': true } : null;
    };
  }
  
  emailArrayValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const emails = control.value;
      
      if (!Array.isArray(emails)) {
        return null; // Return null if value is not an array
      }
  
      // Check for invalid email addresses in the array
      for (const email of emails) {
        const validationError = this.emailValidator(email)(new FormControl(email));
        if (validationError) {
          return { 'email': true }; // Return error if any email is invalid
        }
      }
  
      return null; // Return null if all emails are valid
    };
  }




}
