//Funciones útiles comunes
load('libraries/functions_utils.js');

//Nombre de la coleccion
var COLLECT_NAME = 'COLLECTION_NAME_A';

//Enumerar los campos a modificar de cada tipo en la colección
var COLLECT_NAME_STRINGS= ['name', 'surnames', 'bankEntity', 'address', 'email'];
var COLLECT_NAME_NUMBERS_ST= ['mobileNumber', 'phoneNumber', 'postalCode'];
var COLLECT_NAME_DECIMAL= ['salary'];
var COLLECT_NAME_INTEGER= ['budget'];
var COLLECT_NAME_SPECIALS= ['nif', 'numberAccount'];

//Seleccionar la base de datos
db = db.getSiblingDB(NAME_DB);

print("******ENMASCARANDO "+ COLLECT_NAME +" ************");//Log

//Modificar campos de texto String
maskStringFields(COLLECT_NAME, COLLECT_NAME_STRINGS);

//Modificar campos numericos, pero en formato String
maskNumberStringFields(COLLECT_NAME, COLLECT_NAME_NUMBERS_ST);

//Modificar campos numericos
maskDecimalFields(COLLECT_NAME, COLLECT_NAME_DECIMAL, 10000, 60000, 2);

//Modificar campos enteros
maskIntegerFields(COLLECT_NAME, COLLECT_NAME_INTEGER, 0, 15000);

//Modificar campos especiales, cogerá un elemento aleatorio de un Array, proporcionado en su fichero correspondiente de la carpeta /randoms
maskSpecialFields(COLLECT_NAME, COLLECT_NAME_SPECIALS);

print("******FIN ENMASCARADO "+ COLLECT_NAME +" ************");//Log

