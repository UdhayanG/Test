import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-mailverification',
  templateUrl: './mailverification.component.html',
  styleUrls: ['./mailverification.component.css']
})
export class MailverificationComponent implements OnInit {

token: string;
constructor(private route: ActivatedRoute,private userService: UserService,private router: Router,) {
    console.log('Called Constructor');
    this.route.queryParams.subscribe(params => {
        this.token = params['token'];
        console.log('Called sss', this.token);
    });
}

  ngOnInit(): void {
   // console.log('oninit=======>', this.token);
  }

  verifyMail() {

    console.log('verifyMail=======>', this.token);
		this.userService.mailVerify(this.token).subscribe(data => {
			console.log(data);
			this.router.navigate(['Profile']);
		});

  }
	

}
