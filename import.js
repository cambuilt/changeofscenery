// Imports
const firestoreService = require('firestore-export-import');
const firebaseConfig = require('./src/app/google-map/config.js');
const serviceAccount = require('./serviceAccount.json');

// JSON To Firestore
const jsonToFirestore = async () => {
  try {
    console.log('Initialzing Firebase');
    await firestoreService.initializeApp(serviceAccount, firebaseConfig.databaseURL);
    console.log('Firebase Initialized');
    await firestoreService.restore('./DCMarker.json');
    console.log('Upload Success');
  }
  catch (error) {
    console.log(error);
  }
};

jsonToFirestore();