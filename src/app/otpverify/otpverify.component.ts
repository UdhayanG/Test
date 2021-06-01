import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-otpverify',
  templateUrl: './otpverify.component.html',
  styleUrls: ['./otpverify.component.css']
})
export class OtpverifyComponent implements OnInit {
  @ViewChild('secondDialog') secondDialog: TemplateRef<any>;
  form: FormGroup;
  submitted = false;
  constructor(private readonly fb: FormBuilder,private userService: UserService,private router: Router,
    private dialog: MatDialog,) {
    this.form = this.fb.group({
			OTP: ['', Validators.required],
      RequestID:[localStorage.getItem("RequestID")],
      PhoneNumber:[localStorage.getItem("PhoneNumber")]
		});
   }
   get otpvalidation() { return this.form.controls; }
  ngOnInit(): void {
  }
  submitForm(){
   this.submitted = true;
  
   this.userService.otpVerify(this.form.getRawValue()).subscribe(data => {
    console.log(data);
    if (data=="OTP verified Successfully"){
      this.form.reset();
      localStorage.clear();
      //localStorage.setItem("OTP",JSON.stringify(data));
      this.dialog.open(this.secondDialog);
      this.router.navigate(['']);

    }
  });
  }

}
