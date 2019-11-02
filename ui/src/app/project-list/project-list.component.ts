import { Component, OnInit } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { AuthService } from "app/shared/auth.service";
import { Router } from "@angular/router";
import { UserInfo } from "app/shared/user-info";
import { map } from "rxjs/operators";
import {
    AngularFirestore,
    AngularFirestoreCollection,
    AngularFirestoreDocument
} from "@angular/fire/firestore";

export interface ProjInfo {
    id?: string;
    name: string;
}

@Component({
    selector: "app-project-list",
    templateUrl: "./project-list.component.html",
    styleUrls: ["./project-list.component.css"]
})
export class ProjectListComponent implements OnInit {
    selectedProject: string;
    currUser: UserInfo;
    myuserInfo: Observable<UserInfo>;
    projectCollection: AngularFirestoreCollection<any>;
    projectList$Arr: Observable<any[]>;
    projectListSnapshot: any;
    projects: any[];

    constructor(
        private authService: AuthService,
        private afs: AngularFirestore,
        private router: Router
    ) {}

    // This component displayed only when user is authenticated.
    ngOnInit() {
        // Get ref to the authService behaviour subject
        this.myuserInfo = this.authService.userInfo;
        // Get reference to the projects collection
        this.myuserInfo.subscribe(userInfo => {
            console.log("Email Id : " + userInfo.email);
            this.currUser = userInfo;
            this.projectCollection = this.afs
                .collection("users")
                .doc(userInfo.email)
                .collection("projects");

            // Get list of all projects
            /*
            this.projectList$ = this.projectCollection.valueChanges();
            this.projectList$.subscribe(projs => {
                console.log("projs " + projs);
                this.projects = projs;
            }); */

            this.projectList$Arr = this.projectCollection
                .snapshotChanges()
                .pipe(
                    map(arr => {
                        console.log("Here is list of project docs");
                        console.log(arr);
                        return arr.map(snap => {
                            const id = snap.payload.doc.id;
                            const name = snap.payload.doc.data();
                            return { id, ...name };
                        });
                    })
                );
        });
    }

    currentUser(): Observable<UserInfo> {
        return this.authService.currentUser();
    }

    // When user clicks on create new project.
    createNewProj(newProjName) {
        console.log("New Project is " + newProjName.value);
        // create a randomId to add a project in firstore
        var pid = this.randomId(newProjName.value);
        // read the name of new project entered by user
        this.selectedProject = newProjName.value;
        console.log("Project Id is " + pid);
        // Update the project name into DB

        this.afs
            .collection("users")
            .doc(this.currUser.email)
            .collection("projects")
            .doc(pid)
            .set({ name: newProjName.value })
            .then(() => {
                // Jump to project detailed page from here to add images
                console.log("new project created!");
                this.router.navigate(["/project", newProjName.value, pid]);
            })
            .catch(err => {
                console.log("project create error " + err);
                this.router.navigate([""]);
            });
    }

    // create a randomId to add a project in firstore
    // Input: projectname
    // Output : projectname+ranfomId
    randomId(pName) {
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0)
                .toString(16)
                .substring(1);
        };
        return pName + (S4() + S4() + S4());
    }

    onEdit(project) {
        console.log(project);
        this.router.navigate(["/projects", project.name, project.id]);
    }

    onDelete(project) {
        console.log(project);
        //this.router.navigate(["/projects", project.name, project.id]);
    }
}
