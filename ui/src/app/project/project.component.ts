import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router, Routes } from "@angular/router";
import {
    AngularFireStorage,
    AngularFireStorageReference,
    AngularFireUploadTask
} from "@angular/fire/storage";

import {
    AngularFirestore,
    AngularFirestoreCollection,
    AngularFirestoreDocument
} from "@angular/fire/firestore";

interface ImgInfo {
    id?: string;
    imgurl: string;
    des: string;
}

import { Observable } from "rxjs";
import { map, finalize } from "rxjs/operators";
import { AuthService } from "app/shared/auth.service";
import { UserInfo } from "app/shared/user-info";

@Component({
    selector: "app-project",
    templateUrl: "./project.component.html",
    styleUrls: ["./project.component.css"]
})
export class ProjectComponent implements OnInit {
    projName: string;
    projId: string;
    selectedProject: string;
    currUser: UserInfo;
    myuserInfo: Observable<UserInfo>;
    imageCollection: AngularFirestoreCollection<any>;
    imageList$Arr: Observable<any[]>;
    projects: any[];

    constructor(
        private authService: AuthService,
        private afs: AngularFirestore,
        private afStorage: AngularFireStorage,
        private rt: ActivatedRoute,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.rt.paramMap.subscribe((params: ParamMap) => {
            console.log(JSON.stringify(params));
            this.projName = params.get("pname");
            this.projId = params.get("pid");
            console.log(this.projName);
            console.log(this.projId);

            // Get ref to the authService behaviour subject
            this.myuserInfo = this.authService.userInfo;
            // Get reference to the projects Image collection
            this.myuserInfo.subscribe(userInfo => {
                console.log("Email Id : " + userInfo.email);
                this.currUser = userInfo;
                this.imageCollection = this.afs
                    .collection("users")
                    .doc(userInfo.email)
                    .collection("projects")
                    .doc(this.projId)
                    .collection("imgInfo");

                // Now get the list of images in this project

                this.imageList$Arr = this.imageCollection
                    .snapshotChanges()
                    .pipe(
                        map(arr => {
                            console.log("Here is list of image des docs");
                            console.log(arr);
                            return arr.map(snap => {
                                const id = snap.payload.doc.id;
                                const url = snap.payload.doc.data().imgurl;
                                const des = snap.payload.doc.data().des;
                                return { id: id, url: url, des: des };
                            });
                        })
                    );
            });
        });
    }

    addImgDes() {
        var desid = this.randomId();
        this.router.navigate(["imgDes", desid], { relativeTo: this.route });
    }

    // create a randomId to add a project in firstore
    // Input: projectname
    // Output : projectname+ranfomId
    randomId() {
        var S4 = function() {
            return (((1 + Math.random()) * 0x10000) | 0)
                .toString(16)
                .substring(1);
        };
        return S4() + S4() + S4();
    }

    deleteImgDes(imgDes) {
        this.imageCollection
            .doc(imgDes.id)
            .delete()
            .then(err => {
                console.log("Now deleting the image frm storage");
                console.log(imgDes.url);
                // Create a reference to the file to delete

                this.afStorage.storage
                    .refFromURL(imgDes.url)
                    .delete()
                    .then(() => {
                        console.log("Image deleted");
                    });
            });
    }
}
