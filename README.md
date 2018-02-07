# mongo-data-masker
Utilidad para enmascarar campos en colecciones MongoDB a través de Scripts para Mongo Shell

## Tipos de archivos:
**mask_XXX.js**: Fichero principal que debe ejecutarse, representa una colección concreta con los campos a enmascarar y su tipo.

**random_XXX.js**: Fichero con un Array de datos aleatorios. Algunos campos son especiales (por ejemplo, un NIF), así que en esos casos, creamos un Array con una serie de datos generados y válidos como colección de datos de prueba.

**functions_utils.js**: Fichero donde están definidas todas las funciones necesarias para recorrer las colecciones y enmascarar los datos con campos random, en principio, este fichero ya está implementado con la lógica necesaria y NO SERÁ NECESARIO EDITARSE, a no ser que en el futuro, aparezca alguna condición nueva o el enmascaramiento de datos no cumpla con un nuevo caso concreto, en ese caso si se deberá revisar dichas funciones o añadir funciones nuevas.

**init_mask.js**: Fichero de ejemplo, en vez de ejecutar cada fichero mask_XXX.js por separado, se podría ejecutar un fichero como este, para declarar los parámetros de entrada necesarios y ejecutar una serie de ficheros mask_XXX.js de forma secuencial.

>NOTA de init_mask.js: En un entorno local, este tipo de ficheros de ejemplo nos ayuda a ejecutar todos los ficheros que se quieran a la vez y comprobar su resultado. Pero para el resto de entornos, ejecutar a la vez varios ficheros que afecten a varias colecciones/bases de datos podría provocar una saturación de los recursos y dejar el clúster bloqueado, por lo que no se recomienda utilizar este fichero de ejemplo en entornos de PRE/PRO.

## Cómo se ejecuta:
El usuario deberá ejecutar el fichero mask_XXX.js que corresponda con la colección en la que se quiera enmascarar sus datos.

>NOTA: Puede que por cada entorno, las bases de datos no se llamen igual, por lo que el nombre que tendrá(n) la(s) base(s) de dato(s) a recorrer se tiene que introducir como parámetro de entrada, por ejemplo en un entorno de DESARROLLO, las bases de datos podrán tener el sufijo añadido '_dev'.


Para ejecutar un fichero .js en MongoDB se puede realizar de varias formas:

1)Desde un terminal: Ejecutar mongo mask_XXX.js (con --eval podemos añadir parámetros de entrada).
```
mongo --eval "var NAME_DB = 'MY_DATABASE_NAME';" mask_COLLECTION_EXAMPLE.js
``` 

2)Desde Mongo Shell: Ejecutar load('mask_XXX.js'); (la primera vez, deberemos declarar las variables con los nombres de las bases de datos a las que apuntar).

```var MY_DATABASE_NAME = "NAME_DB";
load('mask_COLLECTION_EXAMPLE.js');
``` 

3)Ejecutar directamente el fichero init_mask.js: Tanto por terminal o por Shell, ejecutar el fichero que tendrá los nombres de las bases de datos y los ficheros a ejecutar.

```
//Nombres de las bases de datos necesarias
var MY_DATABASE_NAME = "NAME_DB";

//Script co coleccion que queramos enmascarar
load('mask_T_USERS.js');
```

## Cómo añadir/editar ficheros mask_XXX.js:
Los ficheros **mask_XXX.js** son los ficheros que se ejecutan para enmascarar cada tabla, si en el futuro se necesitase crear nuevos ficheros o modificar los campos de los actuales, el contenido de estos ficheros para que funcione correctamente es el siguiente:

*1.-Añadir la librería functions_utils.js para poder utilizar todos sus métodos de enmascarado.

*2.-Declarar los nombres de los campos a enmascarar por cada tipo.

*3.-Declarar el nombre de la colección a recorrer y buscar esos campos.

*4.-Conectar con la base de datos correcta.

*5.-Llamar a los métodos que enmascaran los campos por cada tipo.

