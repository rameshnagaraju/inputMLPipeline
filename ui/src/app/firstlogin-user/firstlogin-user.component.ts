import { Component, OnInit } from "@angular/core";
import { AuthService } from "app/shared/auth.service";
import { UserInfo } from "app/shared/user-info";
import { Observable } from "rxjs";

@Component({
    selector: "app-firstlogin-user",
    templateUrl: "./firstlogin-user.component.html",
    styleUrls: ["./firstlogin-user.component.css"]
})
export class FirstloginUserComponent implements OnInit {
    constructor(private authService: AuthService) {}

    currentUser(): Observable<UserInfo> {
        return this.authService.currentUser();
    }
    ngOnInit() {}
}
