import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface UserBasicInfo {
  username: string;
  displayPicture: File | null;
  firstName: string;
  lastName: string;
  displayName: string;
}

@Component({
  selector: 'app-new-user',
  imports: [FormsModule],
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css', '../../../styles.css'],
})
export class NewUserComponent {
  userInfo = model<UserBasicInfo>({
    username: '',
    displayPicture: null,
    firstName: '',
    lastName: '',
    displayName: '',
  });

  constructor() {}

  saveUserInfo = (): void => {
    try {
    } catch (err) {
      console.log('error while saving user info:', err);
    }
  };
}
