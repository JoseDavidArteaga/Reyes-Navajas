package co.edu.unicauca.UsuariosMicroService.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Attempts to ensure `users.id` column is AUTO_INCREMENT on MySQL during startup.
 * This is a best-effort helper for developer environments where the table existed
 * without AUTO_INCREMENT. It will only run when the datasource is reachable.
 */
@Component
@Order(0)
public class SchemaAutoIncrementFixer {

    @Autowired
    private JdbcTemplate jdbc;

    public SchemaAutoIncrementFixer() {
    }

    // run on bean creation
    @Autowired
    public void init() {
        try {
            // Check whether the table exists
            Integer count = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users'",
                    Integer.class);

            if (count == null || count == 0) {
                System.out.println("[SchemaAutoIncrementFixer] users table does not exist — creating with AUTO_INCREMENT id");
                try {
                    jdbc.execute("CREATE TABLE IF NOT EXISTS users (id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(255) NOT NULL, contrasenia VARCHAR(255), rol VARCHAR(255), telefono VARCHAR(255), estado BOOLEAN, UNIQUE KEY uc_users_nombre (nombre)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                    System.out.println("[SchemaAutoIncrementFixer] users table created");
                } catch (Exception ex) {
                    System.err.println("[SchemaAutoIncrementFixer] Could not create users table: " + ex.getMessage());
                }
            } else {
                // table exists — check column EXTRA
                String extra = jdbc.queryForObject(
                        "SELECT EXTRA FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='id'",
                        String.class);

                if (extra == null || !extra.toLowerCase(Locale.ROOT).contains("auto_increment")) {
                    System.out.println("[SchemaAutoIncrementFixer] users.id is not AUTO_INCREMENT - attempting ALTER TABLE");
                    try {
                        jdbc.execute("ALTER TABLE users MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY");
                        System.out.println("[SchemaAutoIncrementFixer] Successfully altered users.id to AUTO_INCREMENT");
                    } catch (Exception ex) {
                        System.err.println("[SchemaAutoIncrementFixer] Could not alter users.id: " + ex.getMessage());
                        System.err.println("[SchemaAutoIncrementFixer] You may need to run the SQL 'ALTER TABLE users MODIFY COLUMN id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY' manually with DB privileges.");
                    }
                } else {
                    System.out.println("[SchemaAutoIncrementFixer] users.id already AUTO_INCREMENT");
                }
            }
        } catch (Exception e) {
            // datasource may not be available or table doesn't exist yet — ignore.
            System.err.println("[SchemaAutoIncrementFixer] Skipping schema check: " + e.getMessage());
        }
    }
}
