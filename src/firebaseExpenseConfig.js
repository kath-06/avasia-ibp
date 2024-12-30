import firebase from "firebase";
require("firebase/firestore");

var firebaseExpenseConfig = {
	apiKey: "AIzaSyDUoAP33LrGmh4E7p0HBW8cmneumafKZls",
    authDomain: "expensemonitoring-d3fe7.firebaseapp.com",
    projectId: "expensemonitoring-d3fe7",
    storageBucket: "expensemonitoring-d3fe7.appspot.com",
    messagingSenderId: "92038358257",
    appId: "1:92038358257:web:9e5caf4ecf3ff8c2c3b550",
    measurementId: "G-VW1HLBH9Y2"
};
let secondary = firebase.initializeApp(firebaseExpenseConfig, "expense");
firebase.analytics();