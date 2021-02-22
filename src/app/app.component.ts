import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'usermodule';
  showHead: boolean = false;

  ngOnInit() {
  }

  constructor(private router: Router) {
  // on route change to '/Registration', set the variable showHead to false
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        if (event['url'] == '/Registration' || event['url'] == '/' ||event['url'] == '/About'||event['url'] == '/Contact') {
          this.showHead = true;
        } else {
          this.showHead = false;
        }
      }
    });
  }
}
