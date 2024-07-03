import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const idToken = getIdToken();
  console.log('idToken:', idToken)
  const  cloned = req.clone({
    setHeaders: {
      Authorization: `Bearer ${idToken}`
    }
  });
  return next(cloned);
};

function getIdToken() {
  // Get all keys from localStorage
  const keys = Object.keys(localStorage);

  // Find the key that ends with 'idToken'
  const idTokenKey = keys.find(key => key.endsWith('idToken'));

  if (idTokenKey) {
    // Return the value associated with the idToken key
    return localStorage.getItem(idTokenKey);
  } else {
    console.log('idToken not found in localStorage');
    return null;
  }
}
