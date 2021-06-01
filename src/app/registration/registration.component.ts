import { Component, ElementRef, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService, SocialLoginModule, SocialUser } from 'angularx-social-login';
import { MustMatch } from '../services/mustMatch';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';




@Component({
	selector: 'app-registration',
	templateUrl: './registration.component.html',
	styleUrls: ['./registration.component.css'],
	providers: [SocialLoginModule, SocialAuthService]
})
export class RegistrationComponent implements OnInit {
	@ViewChild('phonenumber') phonenumber: ElementRef;
	@ViewChild('email') email: ElementRef;	
	@ViewChild('secondDialog') secondDialog: TemplateRef<any>;
	@ViewChild('firstDialog') firstDialog: TemplateRef<any>;
	@ViewChild('loginFail') loginFail: TemplateRef<any>;
	@ViewChild('myModal') myModal: TemplateRef<any>;

	

	fbUser:any;
	user: SocialUser;
	submitted = false;
	form: FormGroup;
	loginForm: FormGroup;
	accData: any;
	phoneform: FormGroup;

	isShown: boolean = false ; // hidden by default
	cookieValue: string;


	constructor(private dialog: MatDialog, private authService: SocialAuthService,
		private router: Router,
		private userService: UserService,
		private readonly fb: FormBuilder,private cookieService: CookieService ) {

		this.form = this.fb.group({
			Command: ['Email'],
			FirstName: ['', Validators.required],
			LastName: ['', Validators.required],
			MiddleName: [''],
			EmailAddress: ['', [Validators.required, Validators.email]],
			Password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required]
		},
			{
				validator: MustMatch('Password', 'confirmPassword')
			});

		this.loginForm = this.fb.group({
			UserName: ['', Validators.required],
			Password: ['', Validators.required]
		});


		this.phoneform = this.fb.group({
			Command: ['Phone'],
			FirstName: ['', Validators.required],
			LastName: ['', Validators.required],
			MiddleName: [''],
			PhoneNumber: [null, [Validators.required, Validators.pattern("[0-9 ]{12}")]],
			Password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required]
		},
			{
				validator: MustMatch('Password', 'confirmPassword')
			});

			

	}
	ngOnInit(): void {
		//this.cookieValue = this.cookieService.get('Test');
		//console.log("cooki values",this.cookieValue);
	//	console.log("values",JSON.parse(this.cookieValue));
		//console.log(localStorage.getItem("OTP"));
	}

	get formvalidation() { return this.form.controls; }
	get loginvalidation() { return this.loginForm.controls; }
	get phoneformvalidation() { return this.phoneform.controls; }

	submitForm() {
		this.submitted = true;
		if (this.form.invalid) {
			return;
		}
		this.cookieService.set( 'Test', JSON.stringify(this.form.getRawValue()));
 		this.cookieValue = this.cookieService.get('Test');
		 console.log("cooki values",this.cookieValue);
		this.userService.registerUser(this.form.getRawValue()).subscribe(data => {
			
			console.log(data);
		
							
				if ("ErrStatus" in data) {
					if (JSON.stringify(data["ErrStatus"]).includes('User Name')) {
						//this.renderer.setStyle(this.phonenumber.nativeElement.focus(), 'background-color', 'red');
						this.email.nativeElement.focus();
						this.dialog.open(this.firstDialog);
					}
				}
				else {
					this.phoneform.reset();
					this.router.navigate(['Dashboard']);
				}
				

		
			//this.form.reset();
			//this.router.navigate(['Dashboard']);
		});

	}


	submitFormPhone() {
		this.submitted = true;
		if (this.phoneform.invalid) {
			return;
		}
		this.userService.registerUser(this.phoneform.getRawValue()).subscribe(data => {
			console.log(data);
			if ("ErrStatus" in data) {

				if (JSON.stringify(data["ErrStatus"]).includes('User Name')) {
					//this.renderer.setStyle(this.phonenumber.nativeElement.focus(), 'background-color', 'red');
					this.phonenumber.nativeElement.focus();
					this.dialog.open(this.secondDialog);
				}
				if (JSON.stringify(data["RequestID"])!="" ||JSON.stringify(data["RequestID"])!=null  ) {
					this.phoneform.reset();
					localStorage.setItem('RequestID', data['RequestID']);
					localStorage.setItem('PhoneNumber', data['PhoneNumber']);
					this.router.navigate(['OtpVerify']);
				}

			}
			else {
				this.phoneform.reset();
				this.router.navigate(['Dashboard']);
			}
			//this.phoneform.reset();
			//this.router.navigate(['Dashboard']);
		});

	}

	async signInWithGoogle(): Promise<any> {
		this.user = await this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
		console.log(this.user);
		// this.router.navigate(['Profile']).then(() => {
		// window.location.reload();
		//});
		//coommeted for temprory pupose above code is hardcoded 
		this.userService.socialRegister(this.user).subscribe(data => {
			console.log(data);
			this.router.navigate(['Profile']);
		});
	}

	loginWithFacebook(): void {
		this.fbUser = this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
		console.log("fb ===========>",JSON.stringify(this.fbUser));
	  }

	async signIn() {
		//console.log("ppppppppppppp"+this.loginForm)
		this.userService.signIn(this.loginForm.getRawValue()).subscribe(data => {
			console.log(data);
			if(data!=null){
			localStorage.setItem('token', data['token']);
			console.log(localStorage.getItem('token'))
			document.getElementById('modalClose').click();
			this.router.navigate(['Profile']);
			}else{

			document.getElementById('modalClose').click();
			this.dialog.open(this.loginFail);	
			//this.dialog.open(this.myModal);	
			}
			
		});
		//console.log("ppppppppppppp"+this.loginForm.getRawValue)

	}

}
