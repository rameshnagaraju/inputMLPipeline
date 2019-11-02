import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
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
    selector: "app-img-des-add",
    templateUrl: "./img-des-add.component.html",
    styleUrls: ["./img-des-add.component.css"]
})
export class ImgDesAddComponent implements OnInit {
    projName: string;
    projId: string;
    uploadedURL: string;
    downloadSrc: string;
    imgInfoCollection: AngularFirestoreCollection<ImgInfo>;
    imginfo: ImgInfo = {
        imgurl: "",
        des: ""
    };
    public imagePath;
    imgURL: any;
    showNextBtn: any;
    public message: string;
    public ides: any;
    ref: AngularFireStorageReference;
    task: AngularFireUploadTask;
    uploadProgress: Observable<number>;
    downloadURL: Observable<string>;
    uploadState: Observable<string>;
    showProgressBar = true;

    constructor(
        private authService: AuthService,
        private locationService: Location,
        private router: Router,
        private rt: ActivatedRoute,
        private afStorage: AngularFireStorage,
        private afs: AngularFirestore
    ) {}

    currentUser(): Observable<UserInfo> {
        return this.authService.currentUser();
    }

    ngOnInit() {
        this.rt.paramMap.subscribe((params: ParamMap) => {
            console.log(JSON.stringify(params));
            this.projName = params.get("pname");
            this.projId = params.get("pid");
            console.log(this.projName);
            console.log(this.projId);

            this.currentUser().subscribe(uInfo => {
                console.log("Here is user Info " + JSON.stringify(uInfo));

                this.imgInfoCollection = this.afs
                    .collection("users")
                    .doc(uInfo.email)
                    .collection("projects")
                    .doc(this.projId)
                    .collection("imgInfo");
            });
        });
    }

    upload(f) {
        // Generate Id for upload
        const id = Math.random()
            .toString(36)
            .substring(2);
        // create a reference to the storage bucket location
        this.ref = this.afStorage.ref(id);
        console.log("Image to be uploaded : " + this.imagePath[0]);
        this.showProgressBar = true;
        // the put method creates an AngularFireUploadTask
        // and kicks off the upload
        this.task = this.ref.put(this.imagePath[0]);

        //The AngularFireUploadTask is how you’ll monitor the upload progress.

        this.uploadState = this.task.snapshotChanges().pipe(map(s => s.state));

        //uploadProgress is an observable, and synced in view
        this.uploadProgress = this.task.percentageChanges();

        /*
         Most of the time your UI will display the upload percentage and download url. 
         Since this a common task, firebase makes it a bit easier with two helpful 
         methods: .percentageChanges() and .downloadURL().
      */

        this.task
            .snapshotChanges()
            .pipe(
                finalize(() => {
                    this.downloadURL = this.ref.getDownloadURL();
                    this.downloadURL.subscribe(url => {
                        this.downloadSrc = url;
                        this.imginfo.imgurl = url;
                        var x = this.imgInfoCollection.add(this.imginfo);
                        console.log(x);
                        this.uploadState = null;
                        this.showNextBtn = true;
                    });
                })
            )
            .subscribe();

        this.imginfo.des = f.value.ides;
        /*
      this.downloadURL.subscribe(iurl => {
          console.log(iurl);
          this.imginfo.imgurl = iurl;
          this.imgInfoCollection.add(this.imginfo);
          this.uploadState = null;
          this.showNextBtn = true;
      }); */
    }

    preview(files) {
        if (files.length === 0) return;

        var mimeType = files[0].type;
        if (mimeType.match(/image\/*/) == null) {
            this.message = "Only images are supported.";
            return;
        }

        var reader = new FileReader();
        this.imagePath = files;
        reader.readAsDataURL(files[0]);
        reader.onload = _event => {
            this.imgURL = reader.result;
        };
    }

    nextImageHlr() {
        this.uploadState = null;
        this.imagePath = null;
        this.downloadURL = null;
        this.showNextBtn = false;
        this.showProgressBar = false;
        this.ides = "";
        this.imgURL = null;
    }

    gotoHomeHlr() {
        this.locationService.back();
        // this.router.navigate(["/"]);
    }
}
