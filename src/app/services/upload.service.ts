// import { Injectable } from '@angular/core';
// import { ResourcesService } from './resources.service';
// import * as firebase from 'firebase/app';
// import { FirebaseApp } from '@angular/fire';
// import { Upload } from '../upload';
// import 'firebase/storage';
// import { AngularFireDatabase } from '@angular/fire/database';

// @Injectable({   , -79.934152
// 	providedIn: 'root'
// })
// export class UploadService {
// 	inProgress = false;

// 	constructor(public app: FirebaseApp, private db: AngularFireDatabase, private resourcesService: ResourcesService) { }

// 	pushUpload(gem: any, upload: Upload) {
// 		this.inProgress = true;
// 		const storageRef = firebase.storage().ref();
// 		const uploadTask = storageRef.child(`uploads/${upload.file.name}`).put(upload.file);

// 		uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
// 			(snapshot) => {
// 				// in progress
// 			},
// 			(error) => {
// 				// fail
// 				console.log(error);
// 			},
// 			() => {
// 				// success
// 				upload.name = upload.file.name;
// 				uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
// 					const oldGem = { ...gem }; // Copy
// 					upload.url = downloadURL;
// 					gem.imageUrl = downloadURL;
// 					this.resourcesService.updateGem(gem.id, JSON.stringify(gem));
// 					this.saveFileData(upload);
// 					if (oldGem.imageUrl.indexOf('firebasestorage') > -1) { this.delete(oldGem.imageUrl); }
// 					this.inProgress = false;
// 				});
// 			}
// 		);
// 	}

// 	delete(downloadUrl) {
// 		return firebase.storage().refFromURL(downloadUrl).delete();
// 	}

// 	private saveFileData(upload: Upload) {
// 		console.log('saving with', upload);
// 		this.db.list(`uploads/`).push(upload);
// 	}
// }
