# mongo-data-masker
Utilidad para enmascarar campos en colecciones MongoDB a través de Scripts para Mongo Shell

## Tipos de archivos:
**mask_XXX.js**: Fichero principal que debe ejecutarse, representa una colección concreta con los campos a enmascarar y su tipo.

**random_XXX.js**: Fichero con un Array de datos aleatorios. Algunos campos son especiales (por ejemplo, un NIF), así que en esos casos, creamos un Array con una serie de datos generados y válidos como colección de datos de prueba.

**functions_utils.js**: Fichero donde están definidas todas las funciones necesarias para recorrer las colecciones y enmascarar los datos con campos random, en principio, este fichero ya está implementado con la lógica necesaria y NO SERÁ NECESARIO EDITARSE, a no ser que en el futuro, aparezca alguna condición nueva o el enmascaramiento de datos no cumpla con un nuevo caso concreto, en ese caso si se deberá revisar dichas funciones o añadir funciones nuevas.

**init_mask.js**: Fichero de ejemplo, en vez de ejecutar cada fichero _mask_XXX.js_ por separado, se podría ejecutar un fichero como este, para declarar los parámetros de entrada necesarios y ejecutar una serie de ficheros _mask_XXX.js_ de forma secuencial.

>NOTA de _init_mask.js_: En un entorno local, este tipo de ficheros de ejemplo nos ayuda a ejecutar todos los ficheros que se quieran a la vez y comprobar su resultado. Pero para el resto de entornos, ejecutar a la vez varios ficheros que afecten a varias colecciones/bases de datos podría provocar una saturación de los recursos y dejar el clúster bloqueado, por lo que no se recomienda utilizar este sistema de ejemplo en entornos de PRE/PRO.

## Cómo se ejecuta:
El usuario deberá ejecutar el fichero mask_XXX.js que corresponda con la colección en la que se quiera enmascarar sus datos.

>NOTA: Puede que por cada entorno, las bases de datos no se llamen igual, por lo que el nombre que tendrá(n) la(s) base(s) de dato(s) a recorrer se tiene que introducir como parámetro de entrada, por ejemplo en un entorno de DESARROLLO, las bases de datos podrán tener el sufijo añadido '_dev'.


Para ejecutar un fichero .js en MongoDB se puede realizar de varias formas:

1) Desde un terminal: Ejecutar _mongo mask_XXX.js_ (con --eval podemos añadir parámetros de entrada).
```
mongo --eval "var NAME_DB = 'MY_DATABASE_NAME';" mask_COLLECTION_EXAMPLE.js
``` 

2) Desde Mongo Shell: Ejecutar _load('mask_XXX.js')_; (la primera vez, deberemos declarar las variables con los nombres de las bases de datos a las que apuntar).

```var MY_DATABASE_NAME = "NAME_DB";
load('mask_COLLECTION_EXAMPLE.js');
``` 

3) Ejecutar directamente el fichero init_mask.js: Tanto por terminal o por Shell, ejecutar el fichero que tendrá los nombres de las bases de datos y los ficheros a ejecutar.

```
//Nombres de las bases de datos necesarias
var MY_DATABASE_NAME = "NAME_DB";

//Script co coleccion que queramos enmascarar
load('mask_T_USERS.js');
```

## Cómo añadir/editar ficheros mask_XXX.js:
Los ficheros _mask_XXX.js_ son los ficheros que se ejecutan para enmascarar cada tabla, si en el futuro se necesitase crear nuevos ficheros o modificar los campos de los actuales, el contenido de estos ficheros para que funcione correctamente es el siguiente:

* 1.-Añadir la librería _functions_utils.js_ para poder utilizar todos sus métodos de enmascarado.

* 2.-Declarar el nombre de la colección a recorrer.

* 3.-Declarar los nombres de los campos a enmascarar por cada tipo.

* 4.-Conectar con la base de datos correcta.

* 5.-Llamar a los métodos que enmascaran los campos por cada tipo.

Ejemplo:
```
//Funciones útiles comunes
load('libraries/functions_utils.js'); //Punto 1

//Nombre de la coleccion
var COLLECT_NAME = 'COLLECTION_NAME_A'; //Punto 2

//Enumerar los campos a modificar de cada tipo en la colección
var COLLECT_NAME_STRINGS= ['name', 'surnames', 'bankEntity', 'address', 'email']; //Punto 3.
var COLLECT_NAME_NUMBERS_ST= ['mobileNumber', 'phoneNumber', 'postalCode']; //Son números, pero almacenados como Strings.
var COLLECT_NAME_DECIMAL= ['user.bank.salary']; //Decimales, todos los campos aceptan declararse dentro de subdocumentos con la anotación por puntos.
var COLLECT_NAME_INTEGER= ['budget']; //Enteros
var COLLECT_NAME_SPECIALS= ['nif', 'numberAccount']; //Caracteres especiales

//Seleccionar la base de datos
db = db.getSiblingDB(NAME_DB); //Punto 4

print("******ENMASCARANDO "+ COLLECT_NAME +" ************");//Log

//Modificar campos de texto String
maskStringFields(COLLECT_NAME, COLLECT_NAME_STRINGS); //Punto 5

//Modificar campos numericos, pero en formato String
maskNumberStringFields(COLLECT_NAME, COLLECT_NAME_NUMBERS_ST);

//Modificar campos numericos
maskDecimalFields(COLLECT_NAME, COLLECT_NAME_DECIMAL, 10000, 60000, 2);

//Modificar campos enteros
maskIntegerFields(COLLECT_NAME, COLLECT_NAME_INTEGER, 0, 15000);

//Modificar campos especiales, cogerá un elemento aleatorio de un Array, proporcionado en su fichero correspondiente de la carpeta /randoms
maskSpecialFields(COLLECT_NAME, COLLECT_NAME_SPECIALS);

print("******FIN ENMASCARADO "+ COLLECT_NAME +" ************");//Log
```

Si ya existe un fichero que enmascara esa colección, simplemente habría que añadir el campo a la colección de campos del tipo correcto y que llame a la función de enmascaramiento de ese tipo.

Si no existe un fichero, sería crear uno nuevo y especificar los 5 Puntos correctamente para ese nuevo caso.

Las funciones de enmascarado que existen en el *function_utils.js* son :

* maskStringFields() **Strings**

* maskNumberStringFields() **Números, pero en formato String**

* maskIntegerFields() **Enteros**

* maskDecimalFields() **Decimales**

* maskSpecialFields() **Campos especiales que necesitan datos de prueba** --> tendrá un fichero _random_XXX.js_ asociado.

## Caso particular, el modificar un campo afecta a otro campo duplicado en otra colección:

Durante el análisis en proyectos con campos a enmascarar en distintas colecciones, se han detectado duplicidades en los datos o campos que al modificarse en una colección, deberían modificarse por el mismo valor en otra colección diferente.

Este caso se podría solucionar con un buen rediseño de las colecciones y los modelos, pero no en todos los casos se puede permitir el proyecto un cambio de ese nivel.

Para esos casos, se ha desarrollado una función dentro de _functions_utils.js_ que se ejecuta cada vez que haya una modificación en un campo y comprobará si este campo tiene relación con otro campo de otra colección, en caso afirmativo, se modificará el campo en ambos documentos con el mismo valor para conservar la consistencia.

Dentro del fichero _functions_utils.js_, se encuentra este método llamado **searchDBRefs()** , en caso de que se detecte una nueva relación, habría que indicarse dentro de esa función el caso concreto que cumple esa relación detectada y qué hacer en ese caso.
