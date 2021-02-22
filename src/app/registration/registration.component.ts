import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleLoginProvider, SocialAuthService, SocialLoginModule, SocialUser } from 'angularx-social-login';
import { MustMatch } from '../services/mustMatch';
import { UserService } from '../services/user.service';


@Component({
selector: 'app-registration',
templateUrl: './registration.component.html',
styleUrls: ['./registration.component.css'],
providers: [SocialLoginModule, SocialAuthService]
})
export class RegistrationComponent implements OnInit {

user      : SocialUser;
submitted = false;
form      : FormGroup;
loginForm : FormGroup;
accData   :any ;
phoneform : FormGroup;
register_done =0;
constructor(private authService: SocialAuthService,
	private router: Router,
	private userService: UserService,
	private readonly fb: FormBuilder) {

this.form      = this.fb.group({
FirstName      :['', Validators.required],
LastName       :['', Validators.required],
MiddleName		:[''],
EmailAddress   : ['', Validators.required],
LoginPassword  :['', [Validators.required, Validators.minLength(6)]],
confirmPassword:['', Validators.required]
},
{
validator      : MustMatch('LoginPassword', 'confirmPassword')
});

this.loginForm = this.fb.group({
UserName       : ['', Validators.required],
LoginPassword  :['', Validators.required]
});


this.phoneform      = this.fb.group({
	FirstName      :['', Validators.required],
	LastName       :['', Validators.required],
	MiddleName		:[''],
	PhoneNumber    :[null, [Validators.required, Validators.pattern("[0-9 ]{10}")]],
	LoginPassword  :['', [Validators.required, Validators.minLength(6)]],
	confirmPassword:['', Validators.required]
	},
	{
	validator      : MustMatch('LoginPassword', 'confirmPassword')
	});

}
ngOnInit(): void { 

}

get formvalidation() { return this.form.controls; }
get loginvalidation() { return this.loginForm.controls; }
get phoneformvalidation() { return this.phoneform.controls; }

submitForm() {
this.submitted = true; 
if (this.form.invalid) {
return;
}
this.userService.registerUser(this.form.getRawValue()).subscribe( data => {
console.log(data);
let myObj = JSON.parse(JSON.stringify(data));
console.log(myObj.message);
if(myObj.message == "Registration successful, please check your email for verification instructions"){
	this.register_done = 1;
	this.userService.register_done =1;
}
this.form.reset();
this.router.navigate(['Home']);
});

}


submitFormPhone() {
	this.submitted = true; 
	if (this.phoneform.invalid) {
	return;
	}
	this.userService.registerUserPhone(this.phoneform.getRawValue()).subscribe( data => {
	console.log(data);
	this.phoneform.reset();
	this.router.navigate(['Home']);
	});
	
	}

async signInWithGoogle(): Promise<any> {  

this.user=await this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
console.log(this.user);
// this.router.navigate(['Profile']).then(() => {
// window.location.reload();
//});
//coommeted for temprory pupose above code is hardcoded 
this.userService.socialRegister(this.user).subscribe( data => {
console.log(data);
this.router.navigate(['Profile']);
});
}
async signIn(){
	console.log("ppppppppppppp"+this.loginForm.getRawValue)

}

}
