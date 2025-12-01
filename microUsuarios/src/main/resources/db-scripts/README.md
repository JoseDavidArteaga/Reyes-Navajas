Manual DB script folder for UsuariosMicroService

If your MySQL table `users` currently lacks AUTO_INCREMENT on the `id` column (causing errors like "Field 'id' doesn't have a default value"), run the SQL below with a DB user with ALTER privileges.

1) Open a MySQL client and connect to your database (the one configured in application.yml). Example:

   mysql -u root -p -h localhost bdpruebas

2) Run the ALTER statement to add AUTO_INCREMENT to id:

   ALTER TABLE users MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;

3) If the table doesn't exist yet, create it:

   CREATE TABLE users (
     id BIGINT NOT NULL AUTO_INCREMENT,
     nombre VARCHAR(255) NOT NULL,
     contrasenia VARCHAR(255),
     rol VARCHAR(255),
     telefono VARCHAR(255),
     estado BOOLEAN,
     PRIMARY KEY (id),
     UNIQUE KEY uc_users_nombre (nombre)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

Notes:
- Make a backup before ALTERing an existing table.
- The app contains SchemaAutoIncrementFixer which will try to create or alter the table on startup (best-effort), but if your DB user lacks ALTER/CREATE privileges you'll need to apply the SQL manually.