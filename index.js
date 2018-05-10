const crypto = require('crypto');
const md5 = require('md5');

let random = crypto.randomBytes(64);
let hash = md5(random);

//New Hashed Product-object class
class HashedSku {
  constructor(material, sku, hash) {
    this.MaterialNumber = material;
    this.SSN = sku;
    this.hash = hash;
  }
}

//Stand-in Database
let serialNumbers = [];

//Test if Material & Serial Number combination already exist in Database
const existingSSNTest = (db, val) =>
  db.some(e => `${e.MaterialNumber}-${e.SSN}` === val);

//Test if newly generated hash value already exists in the Database
const existingHashTest = (db, val) => db.some(e => e.hash === val);

//Transform a letter into it's corresponding number
const letterToNumber = val => {
  return val.charCodeAt(0) - 96;
};

//Transform a number into it's corresponding letter
const numberToLetter = val => {
  return String.fromCharCode(96 + val).toUpperCase();
};

//Decides whether the next value in the new hash
//will be a number or letter and invokes the appropriate
//method.
const hashCombiner = (val1, val2) => {
  if (Number(val1) === 0 || Number(val1)) {
    return newNumber(val1, val2);
  }
  return newLetter(val1, val2);
};

//Method that ensures that all values added to the
//hash are a single digit only
//-- Ensures the new hash will remain less than
//18 characters in length
const singleDigit = (val1, val2) => {
  if (val1 + val2 >= 10) {
    return Math.floor((val1 + val2) / 2);
  }
  return val1 + val2;
};

//Tests the conditions under which to call the
//next method to generate the new number to be added to the
//current hash.
const newNumber = (val1, val2) => {
  if (Number(val2) === 0 || Number(val2)) {
    return singleDigit(Number(val1), Number(val2));
  }
  return singleDigit(Number(val1), letterToNumber(val2));
};

//Tests the conditions under which to call
//the next method to generate the new letter
// to be added to the current hash.
const newLetter = (val1, val2) => {
  if (Number(val2) === 0 || Number(val2)) {
    return numberToLetter(letterToNumber(val1) + Number(val2));
  }
  return numberToLetter(letterToNumber(val1) + letterToNumber(val2));
};

//The main hashing function. Sets the needed
//variables, iterates through the split serial-number,
//and returns the updated and sorted Database value.
const hasher = (material, input, alteration) => {
  //required variables
  let val = alteration
      ? `${material.toString()}-${input.toString()}${alteration}`
      : `${material.toString()}-${input.toString()}`,
    hash = md5(val),
    arr1 = hash.slice(0, hash.length / 2).split(''),
    arr2 = hash.slice(hash.length / 2).split(''),
    newHash = [];

  //test if material/serial number comination already exists.
  if (existingSSNTest(serialNumbers, val)) {
    console.log(`Material number ${val} already exists`);
    return;
  }

  //iterates through the split serial-number hashes.
  //Adds the returned values to the current hash.
  for (let i = 0; i < arr1.length; i++) {
    newHash.push(hashCombiner(arr1[i], arr2[i]));
  }

  //tests if the newly generated hash already exists in the Database.
  //Generates a new hash if it does.
  if (existingHashTest(serialNumbers, newHash.join(''))) {
    return hasher(material, input, 'S');
  }

  //Adds the new hashed product-object to the Database.
  serialNumbers.push(new HashedSku(material, input, newHash.join('')));

  //Re-sorts the Database to ensure quick searching in the future.
  serialNumbers = serialNumbers.sort();

  //returns the updated Database.
  return serialNumbers;
};

//Module Tests
console.log(hasher('345ur', hash));
console.log('==========================');
console.log(hasher('345ur', 'Jeffrey'));
console.log('==========================');
console.log(hasher('345ur', '129R734B243I9DSWNEI392374JH4328'));
console.log('==========================');
console.log(hasher('345ur', 'Jeffrey'));
console.log('==========================');
console.log(hasher('29472354', 'Jeffrey'));
