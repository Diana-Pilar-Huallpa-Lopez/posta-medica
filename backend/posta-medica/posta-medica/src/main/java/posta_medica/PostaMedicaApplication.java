package posta_medica;

import com.sun.net.httpserver.HttpServer;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import posta_medica.Config.DbConnection;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

@SpringBootApplication
public class PostaMedicaApplication {

    //private static final int PORT = 8080;

    //public static void main(String[] args) throws Exception {


    public static void main(String[] args) {

        SpringApplication.run(PostaMedicaApplication.class, args);
    }
}
        /* Verificar conexion a base de datos al arrancar
        DbConnection.testConnection();

        // Crear servidor HTTP
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Registrar todas las rutas API + archivos estaticos
        //Router.register(server);

        // Pool de hilos para manejar peticiones concurrentes
        server.setExecutor(Executors.newFixedThreadPool(10));
        server.start();

        System.out.println("===========================================");
        System.out.println("  Posta Medica - Servidor iniciado");
        System.out.println("  http://localhost:" + PORT);
        System.out.println("===========================================");
    }

	//public static void main(String[] args) {
	//	SpringApplication.run(PostaMedicaApplication.class, args);
	//}

    */



