import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {FormGroup, NgForm} from '@angular/forms'
import { FormBuilder } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  loginForm: FormGroup; 

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,) 
    { 
    this.loginForm=new FormGroup({ 
      username:new FormControl(''), 
      password:new FormControl(''), 
      }) 
     
  }
 
  ngOnInit(): void { 

    if(this.userService.register_done){
  var x = document.getElementById("snackbar");
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  this.userService.register_done =0;
    }

  }

login(){ 

let loginData ={
  UserName : this.loginForm.value.username,
  LoginPassword : this.loginForm.value.password
}
;
console.log(JSON.stringify(loginData));

this.userService.loginCheck( loginData ).subscribe(data =>{
  console.log(data);

}) ;
 
this.router.navigate(['Dashboard']);
 
}

}
