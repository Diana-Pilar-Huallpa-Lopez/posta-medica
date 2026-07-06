package posta_medica.Config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DbConnection {

    private static final String URL      = "jdbc:mysql://localhost:3306/posta_medica"
            + "?useSSL=false&serverTimezone=America/Lima"
            + "&allowPublicKeyRetrieval=true"
            + "&characterEncoding=UTF-8";
    private static final String USER     = "root";
    private static final String PASSWORD = "root";
    // ─────────────────────────────────────────────────────────────────────

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Driver MySQL no encontrado. "
                    + "Agrega mysql-connector-java al classpath.", e);
        }
    }

    /**
     * Abre y devuelve una nueva conexion.
     * Usa en bloques try-with-resources para cerrarla automaticamente.
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    /** Verifica la conexion al arrancar el servidor. */
    public static void testConnection() {
        try (Connection c = getConnection()) {
            System.out.println("[DB] Conexion a MySQL: OK ("
                    + c.getMetaData().getDatabaseProductVersion() + ")");
        } catch (SQLException e) {
            System.err.println("[DB] ERROR al conectar: " + e.getMessage());
            System.err.println("  Verifica URL, USER y PASSWORD en DbConnection.java");
        }
    }
}
