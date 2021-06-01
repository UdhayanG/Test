import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

import { SocialUser } from 'angularx-social-login';
import { BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  baseurl: string = "http://localhost:3000/";
  //baseurl: string = "http://13.126.170.121:4000/";

   apiData = new BehaviorSubject<any>(null);
   apiData$ = this.apiData.asObservable();

  //Social Login Service
  socialRegister(userDetails: SocialUser){
    console.log("service==================>"+JSON.stringify(userDetails));
    return this.http.post(this.baseurl + 'api/v1/socialregister', userDetails);
    
  }

  //Registration Service
  registerUser(registrationDetails: any){
    console.log("registrationDetails==================>"+JSON.stringify(registrationDetails));
    return this.http.post(this.baseurl + 'api/v1/register', registrationDetails);
    //return 'success';
  }
  /*registerUserPhone(registrationDetails: any){
    console.log("registrationDetails==================>"+JSON.stringify(registrationDetails));
    //return this.http.post(this.baseurl + 'accounts/registerphone', registrationDetails);
    return this.http.post(this.baseurl + 'api/v1/register', registrationDetails);
    //return 'success';
  }*/

  signIn(registrationDetails: any){
    console.log("registrationDetails==================>"+JSON.stringify(registrationDetails));
    return this.http.post(this.baseurl + 'api/v1/signin', registrationDetails);

  }

  async getUserInfo(){
    const token = localStorage.getItem('token');
    this.headers.append('Authorization', `Bearer ${token}`);
    console.log(this.headers)
    //return this.http.get(this.baseurl + '/api/v1/user', this.headers.append('Authorization', `Bearer ${token}`));
  }

   authenticate(loginDetails:any){    
    console.log("registrationDetails==================>"+JSON.stringify(loginDetails));
    return this.http.post(this.baseurl + '/account/verify-email', loginDetails);

  }
  mailVerify(token:string){    
    var header = {
      headers: new HttpHeaders()
        .set('Authorization',`${token}`)
    }
    return this.http.get(this.baseurl + 'account/verify-email', header);

  }
  otpVerify(registrationDetails: any){
    console.log("registrationDetails==================>"+JSON.stringify(registrationDetails));
    return this.http.post(this.baseurl + 'verifyotp', registrationDetails);
    //return 'success';
  }
  
 
}