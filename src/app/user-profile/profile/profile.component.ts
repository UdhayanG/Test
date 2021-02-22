import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

interface Country {
  value    : string;
  viewValue: string;
}
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  panelOpenState = false; 
  submitted = false;
constructor(private fb: FormBuilder , private _snackBar: MatSnackBar) { }

 


  profileForm = this.fb.group({
  firstName  : ['', Validators.required],
  middleName : ['', Validators.required],
  secondName : ['', Validators.required],
  dob        : ['', Validators.required],
  phoneNumber: ['', Validators.required],
  mailAddress: ['', Validators.required],
});  

  phoneForm = this.fb.group({
  newphoneNumber  : ['', Validators.required] 
});
  emailForm = this.fb.group({
  newMailid  : ['', Validators.email] 
});


  

add_email() {

if(!this.emailForm.valid) {
  alert('Please enter your Email ID '); 
this.submitted = false;
  return false;
} 
else {
  document.getElementById('close_btn2').click();
  this.submitted = true;
  this._snackBar.open("New Email id has been added : ", "Success", {
  duration: 4000,
});
 
}
}  

add_phone() {

if(!this.phoneForm.valid) {
  alert('Please enter your phone number'); 
this.submitted = false;
  return false;
} 
else {
  document.getElementById('close_btn').click();
  this.submitted = true;
  this._snackBar.open("New number has been added : ", "Success", {
  duration: 4000,
});
 
}
}
onSubmit() {

if(!this.profileForm.valid) {
  alert('Please fill all the required fields'); 
this.submitted = false;
  return false;
} 
else {
  this.submitted = true;
  this._snackBar.open("Profile updation : ", "Success", {
  duration: 3000,
});

console.log(this.profileForm.value)
}
}
 

  typesOfShoes: string[]  = ['Boots', 'Clogs'];
  country     : Country[] = [
  {value      : 'IN', viewValue: 'India'},
  {value      : 'USA', viewValue: 'United states of America'},
  {value      : 'JP', viewValue: 'Japan'}
  ];

isValidInput(fieldName): boolean {
    return this.profileForm.controls[fieldName].invalid &&
      (this.profileForm.controls[fieldName].dirty || this.profileForm.controls[fieldName].touched);
}


  ngOnInit(): void {
  }

}
