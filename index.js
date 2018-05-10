const crypto = require('crypto');
const md5 = require('md5');

let random = crypto.randomBytes(64);
let hash = md5(random);

class HashedSku {
  constructor(sku, hash) {
    this.sku = sku;
    this.hash = hash;
  }
}

let serialNumbers = [];

const hasher = (input, alteration) => {
  let num1 = 0,
    num2 = 0,
    val = alteration ? input.toString() + alteration : input.toString(),
    hash = md5(val),
    str1 = hash.slice(0, hash.length / 2),
    str2 = hash.slice(hash.length / 2),
    arr1 = str1.split(''),
    arr2 = str2.split(''),
    newHash = [];

  if (serialNumbers.some(e => e.sku === input)) {
    console.log('Serial number already exists');
    return;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (Number(arr1[i]) === 0 || Number(arr1[i])) {
      num1 = Number(arr1[i]);
      if (Number(arr2[i]) === 0 || Number(arr2[i])) {
        num2 = Number(arr2[i]);
      } else {
        num2 = arr2[i].charCodeAt(0) - 96;
      }
      newHash.push(
        num1 + num2 >= 10 ? Math.floor((num1 + num2) / 2) : num1 + num2
      );
    } else {
      num1 = arr1[i].charCodeAt(0) - 96;
      if (Number(arr2[i]) === 0 || Number(arr2[i])) {
        num2 = Number(arr2[i]);
      } else {
        num2 = arr2[i].charCodeAt(0) - 96;
      }
      newHash.push(
        String.fromCharCode(96 + Math.floor(num1 + num2)).toUpperCase()
      );
    }
  }

  if (serialNumbers.some(e => e.hash === newHash.join(''))) {
    return hasher(input, 'S');
  }
  serialNumbers.push(new HashedSku(input, newHash.join('')));
  serialNumbers = serialNumbers.sort();
  console.log(serialNumbers);
  return newHash.join('');
};

hasher(hash);
hasher('Jeffrey');
hasher('129R734B243I9DSWNEI392374JH4328');
hasher('Jeffrey');
// console.log(md5(hash));
// console.log(md5('jeffrey'));
// console.log(md5('129R734B243I9DSWNEI392374JH4328'));
// console.log(md5('jeffrey'));
