import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
const firebaseConfig = {
    apiKey: "AIzaSyCkoJZQlWpH5nCUc7my3EBv9on5ZseA_mU",
    authDomain: "subastaprogramovil.firebaseapp.com",
    projectId: "subastaprogramovil",
    storageBucket: "subastaprogramovil.firebasestorage.app",
    messagingSenderId: "68409943969",
    appId: "1:68409943969:web:374b7d5dd4b792bff5cde0",
    measurementId: "G-6Q006YL75N"
  };
  const app = initializeApp(firebaseConfig);
  export default database = getFirestore(app);
