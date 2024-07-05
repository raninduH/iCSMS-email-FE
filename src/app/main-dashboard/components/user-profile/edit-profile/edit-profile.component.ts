import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ProfileSettingsService } from "../../../../app-settings/services/profile-settings.service";
import  {AuthenticationService} from "../../../../auth/services/authentication.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {UserProfileDataService} from "../../../services/user-profile-data.service";
import {apiEndpoint} from "../../../../app-settings/config";
import {MessageService} from "primeng/api";


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  username: string = '';
  email: string = ''
  phone: string = ''
  profileImage: string = ''
  timestamp!: number;

  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
    private profileService: ProfileSettingsService,
    private userProfileDataService: UserProfileDataService,
    private messageService: MessageService
  ) { }


  // @ViewChild('fileUploader') fileUploader: any;

  @ViewChild('fileInput') fileInput!: ElementRef;


  selectedFile: File | null = null;


  ngOnInit(): void {
    // this.userProfileDataService.getUserProfileData()
    // this.fetchUserDetails();

    this.timestamp = Date.now();

    this.authService.getIdToken().subscribe((token: any) => {
      this.userProfileDataService.getUserProfileData(token).subscribe((data: any) => {
        console.log(data)
        this.username = data['username'];
        this.email = data['email'];
        this.phone = data['custom:phone_number'];
        this.profileImage = data['custom:profile_image'];
      });
    });
  }


  //janith
  openFileUpload() {
    this.fileInput.nativeElement.click();
  }




  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      let headers = new HttpHeaders();
      const formData = new FormData();
      formData.append('file', this.selectedFile, this.selectedFile.name);
      this.authService.getIdToken().subscribe((token: any) => {
        headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
      });
      this.http.post(apiEndpoint+ '/uploadProfileImage', formData, { headers })
        .subscribe((response: any) => {
          console.log(response);
          window.location.reload();
        }, (error: any) => {
          console.error(error);
        });
    }
  }

  updateProfile() {
    const profileUpdateData = {
      "email": this.email,
      "phone_number": this.phone
    };

    this.authService.getIdToken().subscribe((token: any) => {
      this.userProfileDataService.updateUserProfileData(profileUpdateData, token).subscribe((response: any) => {
        this.messageService.add({severity:'success', summary: 'Success', detail: 'Profile updated successfully'});
        this.loadUserData(); // Call the method to load user data again
      });
    });
  }

  loadUserData() {
    this.authService.getIdToken().subscribe((token: any) => {
      this.userProfileDataService.getUserProfileData(token).subscribe((data: any) => {
        console.log(data);
        this.username = data['username'];
        this.email = data['email'];
        this.phone = data['custom:phone_number'];
        this.profileImage = data['custom:profile_image'];
      });
    });
  }

  getProfileImageUrl() {
    return `${this.profileImage}?${this.timestamp}`;
  }


}
