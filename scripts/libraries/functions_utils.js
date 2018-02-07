//Ficheros auxiliares necesarios
load("randoms/random_IBAN.js");
load("randoms/random_NIF.js")

//Variable global donde se guardan todas las operaciones a ejecutar
var requests = [];

////////////////////////////// FUNCIONES ENMASCARAMIENTO Y REEMPLAZO //////////////////////////////

/**
 * Enmascara los campos de tipo String introducidos en la coleccion seleccionada.
 * AVISO: Se ignoran los caracteres  ' 1234567890@.-'
 * @param {String} nombre de la coleccion
 * @param {Array<String>} array con los nombres de los campos a enmascarar
 */
function maskStringFields(collection_name, fields){
	for (field in fields) {
	  	var i_int = 0;
	  	var currentField  = fields[field];
	  	var documents_cur = db.getCollection(collection_name).find({ [currentField]: { $exists: true } }).snapshot();
	  	var totalSize_int = documents_cur.count();
 
	  	documents_cur.forEach(function(currentDocument){
		 	i_int++;
			var beforeValueField = resolveDotNotation(currentField, currentDocument);
		 	printInfo(i_int, totalSize_int, currentField, beforeValueField, currentDocument._id);//Log
		 	var currentValue = randomiseString(beforeValueField, /[^ 1234567890@.-]/g);
		 		
		 	execUpdate(collection_name, currentDocument._id, currentField, beforeValueField, currentValue);
		 	
		});
		// Ejecutar operaciones finales restantes
		execUpdateFinal(collection_name);
	}
}

/**
 * Enmascara los campos NUMERICOS de tipo String introducidos en la coleccion seleccionada.
 * AVISO: Se ignoran los caracteres  ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
 * @param {String} nombre de la coleccion
 * @param {Array<String>} array con los nombres de los campos a enmascarar
 */
function maskNumberStringFields(collection_name, fields){
	for (field in fields) {
	  	var i_int = 0;
	  	var currentField  = fields[field];
	  	var documents_cur = db.getCollection(collection_name).find({ [currentField]: { $exists: true } }).snapshot();
	  	var totalSize_int = documents_cur.count();

	  	documents_cur.forEach(function(currentDocument){
		 	i_int++;
		 	var beforeValueField = resolveDotNotation(currentField, currentDocument);
		 	printInfo(i_int, totalSize_int, currentField, beforeValueField, currentDocument._id);//Log
		 	var currentValue = randomiseNumberSt(beforeValueField, /[^ ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz]/g);

		 	execUpdate(collection_name, currentDocument._id, currentField, beforeValueField, currentValue);
		});
		// Ejecutar operaciones finales restantes
		execUpdateFinal(collection_name);
	}
}

/**
* Enmascara los campos de tipo numerico introducidos en la coleccion seleccionada.
* @param {String} nombre de la coleccion
* @param {Array<String>} array con los nombres de los campos a enmascarar
* @param {Number} valor numerico minimo del rango
* @param {Number} valor numerico maximo del rango
* @param {Number} numero de decimales maximo
*/
function maskDecimalFields(collection_name, fields, min, max, maxDecimals){
	for (field in fields) {
	  	var i_int = 0;
	  	var currentField  = fields[field];
	  	var documents_cur = db.getCollection(collection_name).find({ [currentField]: { $exists: true } }).snapshot();
	  	var totalSize_int = documents_cur.count();

	  	documents_cur.forEach(function(currentDocument){
		 	i_int++;
		 	var beforeValueField = resolveDotNotation(currentField, currentDocument);
		 	printInfo(i_int, totalSize_int, currentField, beforeValueField, currentDocument._id);//Log
		 	var currentValue = randomiseNumberInRange(min, max, maxDecimals);

		 	execUpdate(collection_name, currentDocument._id, currentField, beforeValueField, currentValue);
		});
		// Ejecutar operaciones finales restantes
		execUpdateFinal(collection_name);
	}
}

/**
* Enmascara los campos de tipo integer introducidos en la coleccion seleccionada.
* @param {String} nombre de la coleccion
* @param {Array<String>} array con los nombres de los campos a enmascarar
* @param {Number} valor numerico minimo del rango
* @param {Number} valor numerico maximo del rango (se queda fuera del rango)
*/
function maskIntegerFields(collection_name, fields, min, max){
	for (field in fields) {
	  	var i_int = 0;
	  	var currentField  = fields[field];
	  	var documents_cur = db.getCollection(collection_name).find({ [currentField]: { $exists: true } }).snapshot();
	  	var totalSize_int = documents_cur.count();

	  	documents_cur.forEach(function(currentDocument){
		 	i_int++;
		 	var beforeValueField = resolveDotNotation(currentField, currentDocument);
		 	printInfo(i_int, totalSize_int, currentField, beforeValueField, currentDocument._id);//Log
		 	var currentValue = NumberInt(randomiseInt(min,max));

		 	execUpdate(collection_name, currentDocument._id, currentField, beforeValueField, currentValue);
		});
		// Ejecutar operaciones finales restantes
		execUpdateFinal(collection_name);
	}
}

/**
* Enmascara los campos especiales conocidos, sustituyendolos por un valor aleatorio de un array proporcionado como constante.
* @param {String} nombre de la coleccion
* @param {Array<String>} array con los nombres de los campos a enmascarar
* {@link https://goo.gl/QdbMcn}
*/
function maskSpecialFields(collection_name, fields){
	for (field in fields) {
	  	var i_int = 0;
	  	var currentField  = fields[field];
	  	var documents_cur = db.getCollection(collection_name).find({ [currentField]: { $exists: true } }).snapshot();
	  	var totalSize_int = documents_cur.count();

	  	documents_cur.forEach(function(currentDocument){
		 	i_int++;
		 	var beforeValueField = resolveDotNotation(currentField, currentDocument);
		 	printInfo(i_int, totalSize_int, currentField, beforeValueField, currentDocument._id);//Log
		 	var currentValue = beforeValueField;

		 	if(currentField.indexOf('nif') !== -1) {
		 		currentValue = randomiseArray(NIF_items);
		 	} else if (currentField.indexOf('numberAccount') !== -1) {
		 		currentValue = randomiseArray(IBAN_items);
		 	}

		 	execUpdate(collection_name, currentDocument._id, currentField, beforeValueField, currentValue);
		});
		// Ejecutar operaciones finales restantes
		execUpdateFinal(collection_name);
	}
}

////////////////////////////// FUNCIONES DOCUMENTOS ANIDADOS //////////////////////////////
// Todas estas funciones y sus condicionales deberian desaparecer con un buen modelo de datos, pero pueden darse duplicidades de datos en colecciones mal planteadas desde el inicio.
// En esos casos conocidos, si enmascaramos un dato de una coleccion, debemos buscar ese dato duplicado en la otra coleccion y modifcar por el mismo valor para mantener la consistencia de los datos.
// Para mantener la consistencia utilizamos estas funciones que realicé para casos concretos en los que me encontré este problema y no se aceptaba un rediseño de la base de datos.

/**
 * Busca relaciones entre dos colecciones (que ya conocemos) para actualizar un campo que esté relacionado entre ellas (si las encuentra)
 * @param {String} coleccion que tiene el campo con el dato ya modificado
 * @param {String} id unívoco del documento hijo anidado donde buscar el campo
 * @param {String} nombre del campo
 * @param {String} valor del campo antes de ser modificado
 * @param {String} valor del campo modificado
 */
function searchDBRefs(from_collection, id_document, currentField, before_value, after_value){
	//Aqui se definen todos los casos detectados de dependencias entre datos de colecciones distintas
	switch(from_collection) {
    	case 'COLLECTION_NAME_A':

    		// Caso especial, se sabe que el dato campo {name} de la colección {COLLECTION_NAME_A} se están guardando también en la {COLLECTION_NAME_B} como dato campo {name_user}.
    		// Por lo que le decimos, cada vez que modifiques un campo {name} de {COLLECTION_NAME_A}, vete a {COLLECTION_NAME_B} y cambia por el mismo valor al campo {name_user}.
    		// OTHER_NAME_DB permite cambiar incluso la base de datos donde se aloja la otra coleccion.
    		if(currentField === 'name') {
				replaceField('OTHER_NAME_DB', 'COLLECTION_NAME_B', 'name_user', before_value, after_value);
			}
        	
        	// Caso mas complejo que el anterior, en este caso, los campos de la colección {COLLECTION_NAME_A} se están guardando también en {COLLECTION_NAME_C}, pero dentro de un subdocumento embebido al documento principal.
    		// Por lo que le decimos, cada vez que modifiques un campo de {COLLECTION_NAME_A}, vete a {COLLECTION_NAME_C} y busca dentro del documento principal un subdocumento llamado {subdocumento} que coincidan sus ids 
    		// Y sustituye los campos que se llamen igual y tengan los mismos valores por los valores nuevos.
    		// OTHER_NAME_DB permite cambiar incluso la base de datos donde se aloja la otra coleccion.
        	replaceChildField('OTHER_NAME_DB', 'COLLECTION_NAME_C', 'subdocumento', id_document, currentField, before_value, after_value);//En COLLECTION_NAME_B hay copias de campo_B

        	break;
	}	
}

/**
 * Sustituye el campo (si existe) de la colecion elegida del valor original al valor nuevo
 * @param {String} nombre base de datos donde modificar el elemento
 * @param {String} nombre coleccion donde buscar el campo
 * @param {String} nombre campo del documento
 * @param {String} valor original del campo
 * @param {String} valor a sustituir del campo
 * @example quiero sustituir dentro de la coleccion COLL, los documentos con el campo CAMPO de valor 1, pasarlo a valor 9-->('COLL', CAMPO', 1, 9)
 */
function replaceField(name_database, collection_name, field_name, before_value, after_value){
	//Si cambiamos de base de datos, guardamos en la que estabamos para reestablecerse al final
	var current_name_database = db.getName();
	db = db.getSiblingDB(name_database);
    
    var documents_cur = db.getCollection(collection_name).find( { [field_name]: before_value } ).snapshot();

    documents_cur.forEach(function(currentDocument){
	 	print("*********************************");
	  	print("REGISTRO " + currentDocument._id); 
	  	print("MODIFICADO " + collection_name  + "." + field_name + " de " + before_value + " a " + after_value); 

	 	currentDocument[field_name]=after_value;
	 	db.getCollection(collection_name).save(currentDocument);
	});

	//Restablecer la base de datos en la que estabamos
    db = db.getSiblingDB(current_name_database);
}

/**
 * Sustituye el campo (si existe y tiene el valor original) del documento hijo anidado dentro del documento principal 
 * @param {String} nombre base de datos donde modificar el elemento
 * @param {String} nombre coleccion donde buscar el documento hijo anidado con ese campo concreto
 * @param {String} nombre documento hijo anidado donde buscar el campo
 * @param {String} id unívoco del documento hijo anidado donde buscar el campo
 * @param {String} nombre campo del documento hijo anidado
 * @param {String} valor original del campo del documento hijo anidado
 * @param {String} valor sustituido del campo del documento hijo anidado
 * @example quiero sustituir dentro de la coleccion COLL, los documentos que tengan un documento hijo llamado DOC, que tenga ese hijo anidado su ID y campo CAMPO con valor 1, pasarlo a valor 9 --> ('COLL', 'DOC', 'ID', 'CAMPO', 1, 9)
 */
function replaceChildField(name_database, collection_parent_name, document_child_name, id_document_child, field_child_name, before_value, after_value){

	//Si cambiamos de base de datos, guardamos en la que estamos para reestablecerse al final
	var current_name_database = db.getName();
	db = db.getSiblingDB(name_database);
    
    var documents_cur = db.getCollection(collection_parent_name).find( 
    								{ $and: [ 
    											{ 
    												[document_child_name +"._id"]: id_document_child 
    											} , 
    											{
    												[document_child_name +"."+ field_child_name]: before_value 
    											} 
    										] 
    								}).snapshot();

    documents_cur.forEach(function(currentDocument){
	 	print("*********************************");
	  	print("REGISTRO " + currentDocument._id); 
	  	print("MODIFICADO " + collection_parent_name + "." + document_child_name  + "." + field_child_name + " de " + before_value + " a " + after_value); 

	 	currentDocument[document_child_name][field_child_name]=after_value;
	 	db.getCollection(collection_parent_name).save(currentDocument);
	});

    //Restablecer la base de datos en la que estabamos
    db = db.getSiblingDB(current_name_database);
}


////////////////////////////// FUNCIONES RANDOM //////////////////////////////

/**
 * Devuelve un texto aleatorio
 * @param {String} cadena a sustituir
 * @param {String} caracteres a ignorar en expresion
 * @return {String} cadena aleatoria sustituyendo caracteres
 */
function randomiseString(str, ignore){
    var chars = "abcdefghijklmnopqrstuvwxyz";
    var _str = str.replace(ignore,function(a){
        return chars[randomiseInt(0,chars.length-1)][randomiseInt(0,1) == 0 ? 'toUpperCase' : 'toLowerCase']();
    });
    return _str;
}

/**
 * Devuelve un numero aleatorio en formato String
 * @param {String} cadena a sustituir
 * @param {String} caracteres a ignorar en expresion
 * @return {String} cadena aleatoria sustituyendo caracteres
 */
function randomiseNumberSt(str, ignore){
    var chars = "0123456789";
    var _str = str.replace(ignore,function(a){
        return chars[randomiseInt(0,chars.length-1)];
    });
    return _str;
}

/**
 * Devuelve un elemento aleatorio del array introducido
 * @param {array} array con elementos
 * @return {String} elemento aleatorio del String
 */
function randomiseArray(array){
    var _str = array[Math.floor(Math.random()*array.length)];
    return _str;
}

/**
 * Devuelve un numero aleatorio entre dos valores con n decimales maximo
 * @param {Number} limite minimo
 * @param {Number} limite maximo
 * @param {Number} numero decimales maximo
 * @return {Number} decimal aleatorio resultado
 */
function randomiseNumberInRange(min, max, maxDecimals) {
  var resultRandom = Math.random() * (max-min) + min;
  var div =  Math.pow(10, maxDecimals);
  return Math.round(resultRandom * div) / div;
}

/**
 * Devuelve un numero entero aleatorio
 * @param {Number} limite minimo (incluido)
 * @param {Number} limite maximo (incluido)
 * @return {Number} numero aleatorio
 */
function randomiseInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

////////////////////////////// FUNCIONES AUXILIARES //////////////////////////////

/**
* Almacena y ejecuta las operaciones de actualizacion si el buffer ya se llenó con 1000 operaciones
* Además llama a la función que busca relaciones conocidas entre documentos
* @param {String} nombre de la coleccion
* @param {idObject} id del documento
* @param {String} nombre del campo a modificar
* @param {Object} valor actual del campo
* @param {Object} valor nuevo del campo
*/
function execUpdate(collection_name, idDocument, currentField, beforeValueField, currentValue) {
requests.push( { 
				    "updateOne": {
				    	"filter": { "_id": idDocument },
				    	"update": { "$set": { [currentField]: currentValue } }
				    }
				});

			 	if (requests.length === 1000) {
		        	// Ejecutar cada 1000 operaciones registradas
		        	db.getCollection(collection_name).bulkWrite(requests);
		        	requests = [];
		    	}
		 		//Comprobar otras relaciones conocidas con otras colecciones
		 		searchDBRefs(collection_name, idDocument, currentField, beforeValueField, currentValue);
}

/**
* Ejecuta las ultimas operaciones de actualizacion que pudieran quedar almacenadas en el buffer de request
*/
function execUpdateFinal(collection_name) {
if (requests.length > 0){
		    db.getCollection(collection_name).bulkWrite(requests);
		    requests = []; 
		}
}

/**
* Permite acceder a los valores (multi-nivel) de un objeto a través del Dot Notation introducido como un String
* Limitations:
* Can't use brackets ([]) for array indices (though specifying array indices between periods works fine)
* Properties with periods in their name cannot be accessed: {'my.favorite.number':42}
* {@link https://goo.gl/4Lbcps}
*
* @param {String} path de la propiedad
* @param {Object} objeto a inspeccionar
* @return {Object} valor de la propiedad
*/
function resolveDotNotation(path, obj) {
    return path.split('.').reduce(function(prev, curr) {
        return prev ? prev[curr] : undefined
    }, obj || self)
}

/**
* Imprime informacion del registro que está siendo modificado
* @param {Number} orden del elemento modificado respecto al total
* @param {Number} total elementos a modificar
* @param {String} nombre del campo a modificar
* @param {Object} valor del campo actual
* @param {Object} id del documento
*/
function printInfo(index, totalSize, currentField, currentValue, idDocument) {
	print("*********************************");
	print("REGISTRO "+ index +" de " + totalSize);   
	print(currentField + ":" + currentValue + "("+idDocument+")");
}