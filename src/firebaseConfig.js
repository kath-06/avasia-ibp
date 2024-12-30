import firebase from "firebase";
require("firebase/firestore");

var firebaseConfig = {
  apiKey: "AIzaSyDdMaN37h0a4f1m1D_hnrK_UBnEzwjvldw",
  authDomain: "checkmonitoring-24389.firebaseapp.com",
  projectId: "checkmonitoring-24389",
  storageBucket: "checkmonitoring-24389.appspot.com",
  messagingSenderId: "526594053924",
  appId: "1:526594053924:web:d2912087870da96c5cc5b1",
  measurementId: "G-RWLHDGS17E"
};
// Initialize Firebase
export default firebase.initializeApp(firebaseConfig);
firebase.analytics();