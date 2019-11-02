import { Component, OnInit } from "@angular/core";
import { AuthService } from "app/shared/auth.service";
import { Observable, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";
import { UserInfo } from "app/shared/user-info";
import { routerNgProbeToken } from "@angular/router/src/router_module";
import {
    AngularFirestore,
    AngularFirestoreCollection
} from "@angular/fire/firestore";
import { userInfo } from "os";

@Component({
    selector: "app-home-page",
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.css"]
})
export class HomePageComponent implements OnInit {
    userInfo: Observable<UserInfo>;
    myuserInfo: Observable<UserInfo>;
    isLoggedIn = new BehaviorSubject(false);
    selectedProject: string;
    projectCollection: AngularFirestoreCollection<any>;
    projectList: Observable<any[]>;
    projectListSnapshot: any;
    projects: any[];

    constructor(
        private authService: AuthService,
        private afs: AngularFirestore,
        private router: Router
    ) {
        this.userInfo = authService.userInfo;
        this.userInfo
            .pipe(map(userInfo => !userInfo.isAnonymous))
            .subscribe(this.isLoggedIn);
    }

    currentUser(): Observable<UserInfo> {
        return this.authService.currentUser();
    }

    ngOnInit() {
        // Get ref to the behaviour subject
        this.myuserInfo = this.authService.userInfo;
        this.myuserInfo.subscribe(userInfo => {
            console.log("Email Id : " + userInfo.email);
            if (userInfo.isAnonymous && userInfo.email != null) {
                console.log("Email Id : " + userInfo.email);
                this.projectCollection = this.afs
                    .collection("users")
                    .doc(userInfo.email)
                    .collection("projects");

                this.projectListSnapshot = this.projectCollection
                    .snapshotChanges()
                    .subscribe(projectArr => {
                        console.log(projectArr);
                        projectArr.map(snap => snap.payload.doc.data);
                    });
            } else {
                this.currentUser().subscribe(uInfo => {
                    // Get reference to the project collection of current user
                    console.log("Here is user Info " + JSON.stringify(uInfo));
                    if (userInfo.isAnonymous && userInfo.email != null) {
                        this.projectCollection = this.afs
                            .collection("users")
                            .doc(uInfo.email)
                            .collection("projects");

                        this.projectList = this.projectCollection.valueChanges();
                        this.projectList.subscribe(x => {
                            console.log(x);
                            this.projects = x;
                        });
                    }
                });
            }
        });
    }

    navigateToLogin(e) {
        this.router.navigate(["/login"]);
        e.preventDefault();
    }

    navigateToRegister(e) {
        this.router.navigate(["/register"]);
        e.preventDefault();
    }

    createNewProj(newProjName) {
        console.log("New Project is " + newProjName.value);
        var pid = this.randomId(newProjName.value);
        this.selectedProject = newProjName.value;

        console.log("Project Id is " + pid);
        this.router.navigate(["/project", newProjName.value, pid]);
    }

    randomId(pName) {
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0)
                .toString(16)
                .substring(1);
        };
        return pName + (S4() + S4() + S4());
    }
}
