import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SocialUser } from 'angularx-social-login';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  register_done = 0;
  //baseurl: string = "http://localhost:4000/";
  baseurl: string = "http://13.126.170.121:4000/";

   apiData = new BehaviorSubject<any>(null);
   apiData$ = this.apiData.asObservable();

  //Social Login Service
  socialRegister(userDetails: SocialUser){
    console.log("service==================>"+JSON.stringify(userDetails));
    return this.http.post(this.baseurl + 'accounts/socialRegister', userDetails);
    
  }

  loginCheck(loginData:any){
console.log("Checking login function"  +loginData.UserName );
let flag = this.http.post(this.baseurl+ 'auth/authenticate',loginData);

return flag;
  }

  //Registration Service
  registerUser(registrationDetails: any){
    console.log("registrationDetails==================>"+JSON.stringify(registrationDetails));

    var numbers = new RegExp(/^[0-9]+$/);
    var email = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    let userNameValue = JSON.parse(JSON.stringify(registrationDetails));
  
  if(numbers.test(userNameValue.EmailAddress))
  {
    registrationDetails.PhoneNumber=userNameValue.EmailAddress;
    console.log("withphonedetails==================>"+JSON.stringify(registrationDetails));

    return this.http.post(this.baseurl + 'accounts/registerphone', registrationDetails);
  }
  if(email.test(userNameValue.EmailAddress))
  {
    return this.http.post(this.baseurl + 'accounts/registeremail', registrationDetails);
  }
  else{
    return this.http.post(this.baseurl + 'accounts/registerphone', registrationDetails);
    //return "invalid UserName"
      
    //return 'success';
  }
 // return 'success';
}
  registerUserPhone(registrationDetails: any){
    console.log("registrationDetails==================>"+JSON.stringify(registrationDetails));
    return this.http.post(this.baseurl + 'accounts/registerphone', registrationDetails);
    //return 'success';
  }

  authenticate(loginDetails:any){
    
    console.log("registrationDetails==================>"+JSON.stringify(loginDetails));
    return this.http.post(this.baseurl + 'auth/authenticate', loginDetails);

  }
 
}