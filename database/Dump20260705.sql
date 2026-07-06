CREATE DATABASE  IF NOT EXISTS `posta_medica` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `posta_medica`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: posta_medica
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `atencion`
--

DROP TABLE IF EXISTS `atencion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atencion` (
  `id_atencion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_cita` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_atencion` datetime DEFAULT NULL,
  `motivo_consulta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diagnostico` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_atencion`),
  KEY `fk_atencion_cita` (`id_cita`),
  CONSTRAINT `fk_atencion_cita` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id_cita`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atencion`
--

LOCK TABLES `atencion` WRITE;
/*!40000 ALTER TABLE `atencion` DISABLE KEYS */;
INSERT INTO `atencion` VALUES ('ATE-0001','CIT-0001','2026-06-19 10:15:00','Alergia en la piel por consumo de mariscos','Dermatitis alérgica aguda'),('ATE-0002','CIT-0002','2026-06-18 07:45:00','Dolor rodilla derecha post-caída','Esguince leve de rodilla'),('ATE-0003','CIT-0003','2026-06-17 09:15:00','Chequeo general anual, fiebre leve','Faringitis viral aguda'),('ATE-0004','CIT-0013','2026-07-05 06:02:01','gggggg','gggggg'),('ATE-0005','CIT-0009','2026-07-05 07:37:58','hhhhh','hhhhh');
/*!40000 ALTER TABLE `atencion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cita`
--

DROP TABLE IF EXISTS `cita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cita` (
  `id_cita` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_paciente` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_medico` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_consultorio` int NOT NULL,
  `fecha_cita` date DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_cita`),
  KEY `fk_cita_paciente` (`id_paciente`),
  KEY `fk_cita_medico` (`id_medico`),
  KEY `fk_cita_consultorio` (`id_consultorio`),
  CONSTRAINT `fk_cita_consultorio` FOREIGN KEY (`id_consultorio`) REFERENCES `consultorio` (`id_consultorio`),
  CONSTRAINT `fk_cita_medico` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`),
  CONSTRAINT `fk_cita_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cita`
--

LOCK TABLES `cita` WRITE;
/*!40000 ALTER TABLE `cita` DISABLE KEYS */;
INSERT INTO `cita` VALUES ('CIT-0001','PAC-0001','MED-0001',1,'2026-06-20','08:00:00','08:30:00','Dolor en el pecho','Paciente ansioso','CONFIRMADA','2026-06-18 10:00:00'),('CIT-0002','PAC-0002','MED-0002',4,'2026-06-21','09:00:00','09:30:00','Control niño sano','','PENDIENTE','2026-06-18 10:15:00'),('CIT-0003','PAC-0003','MED-0003',6,'2026-06-19','10:00:00','10:30:00','Alergia en la piel','','ATENDIDA','2026-06-10 09:00:00'),('CIT-0004','PAC-0004','MED-0004',7,'2026-06-22','14:00:00','14:30:00','Dolor de cabeza crónico','','PENDIENTE','2026-06-18 11:00:00'),('CIT-0005','PAC-0005','MED-0005',9,'2026-06-18','07:30:00','08:00:00','Dolor rodilla derecha','Trajo radiografías','ATENDIDA','2026-06-15 08:00:00'),('CIT-0006','PAC-0001','MED-0004',6,'2026-07-04','10:00:00','11:30:00','Presento dolores en la parte parental de la cabeza. punsadas constantes y mareos',NULL,'PENDIENTE','2026-07-01 01:05:13'),('CIT-0007','PAC-0001','MED-0002',9,'2026-07-03','09:00:00','10:30:00','Me siento muy mal',NULL,'PENDIENTE','2026-07-02 21:59:42'),('CIT-0008','PAC-0001','MED-0002',9,'2026-07-03','09:00:00','10:30:00','Me siento muy mal',NULL,'PENDIENTE','2026-07-02 21:59:46'),('CIT-0009','PAC-0006','MED-0001',1,'2026-07-06','07:00:00','11:30:00','Me siento mal',NULL,'ATENDIDA','2026-07-04 20:42:22'),('CIT-0010','PAC-0006','MED-0003',2,'2026-07-07','07:00:00','10:30:00','Revision',NULL,'PENDIENTE','2026-07-04 21:02:14'),('CIT-0011','PAC-0006','MED-0002',7,'2026-07-15','07:00:00','11:00:00','Revision',NULL,'PENDIENTE','2026-07-04 21:18:58'),('CIT-0012','PAC-0006','MED-0001',1,'2026-07-06','07:00:00','09:30:00','Problemas con el corazon',NULL,'CANCELADA','2026-07-04 23:12:52'),('CIT-0013','PAC-0006','MED-0001',1,'2026-07-06','07:00:00','09:30:00','Problemas con el corazon',NULL,'ATENDIDA','2026-07-04 23:12:57'),('CIT-0014','PAC-0006','MED-0001',5,'2026-07-08','15:00:00','17:00:00','problemas con el corazon',NULL,'PENDIENTE','2026-07-05 19:27:29'),('CIT-0015','PAC-0006','MED-0001',1,'2026-07-06','09:00:00','09:30:00','corazon',NULL,'PENDIENTE','2026-07-05 20:35:54'),('CIT-0016','PAC-0006','MED-0001',1,'2026-07-06','09:00:00','09:30:00','corazon',NULL,'PENDIENTE','2026-07-05 20:36:00'),('CIT-0017','PAC-0005','MED-0001',1,'2026-07-06','09:00:00','09:30:00','corazon',NULL,'CANCELADA','2026-07-05 20:36:51'),('CIT-0018','PAC-0005','MED-0001',1,'2026-07-06','11:30:00','12:30:00','corazon',NULL,'PENDIENTE','2026-07-05 20:54:00');
/*!40000 ALTER TABLE `cita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultorio`
--

DROP TABLE IF EXISTS `consultorio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultorio` (
  `id_consultorio` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_consultorio`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultorio`
--

LOCK TABLES `consultorio` WRITE;
/*!40000 ALTER TABLE `consultorio` DISABLE KEYS */;
INSERT INTO `consultorio` VALUES (1,'Consultorio 101','Piso 1 - Pabellón A','DISPONIBLE'),(2,'Consultorio 102','Piso 1 - Pabellón A','DISPONIBLE'),(3,'Consultorio 103','Piso 1 - Pabellón B','EN_MANTENIMIENTO'),(4,'Consultorio 201','Piso 2 - Pediatría','DISPONIBLE'),(5,'Consultorio 202','Piso 2 - Pediatría','DISPONIBLE'),(6,'Consultorio 203','Piso 2 - Especialidades','DISPONIBLE'),(7,'Consultorio 301','Piso 3 - Especialidades','DISPONIBLE'),(8,'Consultorio 302','Piso 3 - Especialidades','OCUPADO'),(9,'Tópico Urgencias','Planta Baja','DISPONIBLE'),(10,'Sala de Triage','Planta Baja','DISPONIBLE');
/*!40000 ALTER TABLE `consultorio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidad`
--

DROP TABLE IF EXISTS `especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidad` (
  `id_especialidad` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_especialidad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidad`
--

LOCK TABLES `especialidad` WRITE;
/*!40000 ALTER TABLE `especialidad` DISABLE KEYS */;
INSERT INTO `especialidad` VALUES (1,'Cardiología','Problemas con el corazon'),(2,'Pediatría',NULL),(3,'Dermatología',NULL),(4,'Neurología',NULL),(5,'Traumatología',NULL),(6,'Gastroenterología',NULL),(7,'Oftalmología',NULL),(8,'Psiquiatría',NULL),(9,'Ginecología',NULL),(10,'Medicina General',NULL);
/*!40000 ALTER TABLE `especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `horario_medico`
--

DROP TABLE IF EXISTS `horario_medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horario_medico` (
  `id_horario` int NOT NULL AUTO_INCREMENT,
  `id_medico` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia_semana` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_horario`),
  KEY `fk_horariomedico_medico` (`id_medico`),
  CONSTRAINT `fk_horariomedico_medico` FOREIGN KEY (`id_medico`) REFERENCES `medico` (`id_medico`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horario_medico`
--

LOCK TABLES `horario_medico` WRITE;
/*!40000 ALTER TABLE `horario_medico` DISABLE KEYS */;
INSERT INTO `horario_medico` VALUES (1,'MED-0001','LUNES','09:00:00','14:00:00','ACTIVO'),(2,'MED-0002','MARTES','09:00:00','15:00:00','ACTIVO'),(3,'MED-0003','MIERCOLES','08:00:00','12:00:00','ACTIVO'),(4,'MED-0004','JUEVES','14:00:00','19:00:00','ACTIVO'),(5,'MED-0005','VIERNES','07:00:00','13:00:00','ACTIVO'),(7,'MED-0001','MARTES','09:00:00','14:00:00','ACTIVO'),(8,'MED-0001','MIERCOLES','09:00:00','14:00:00','ACTIVO'),(9,'MED-0001','JUEVES','09:00:00','14:00:00','ACTIVO'),(10,'MED-0001','VIERNES','09:00:00','14:00:00','ACTIVO'),(11,'MED-0001','SABADO','10:00:00','14:00:00','ACTIVO');
/*!40000 ALTER TABLE `horario_medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicamento`
--

DROP TABLE IF EXISTS `medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamento` (
  `id_medicamento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `concentracion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_medicamento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamento`
--

LOCK TABLES `medicamento` WRITE;
/*!40000 ALTER TABLE `medicamento` DISABLE KEYS */;
INSERT INTO `medicamento` VALUES ('FAR-0001','Paracetamol','Tabletas','500 mg'),('FAR-0002','Ibuprofeno','Tabletas','400 mg'),('FAR-0003','Amoxicilina','Cápsulas','500 mg'),('FAR-0004','Loratadina','Tabletas','10 mg'),('FAR-0005','Omeprazol','Cápsulas','20 mg'),('FAR-0006','Diclofenaco','Ampolla inyectable','75 mg/3 ml'),('FAR-0007','Azitromicina','Tabletas','500 mg'),('FAR-0008','Salbutamol','Inhalador','100 mcg/dosis'),('FAR-0009','Metformina','Tabletas','850 mg'),('FAR-0010','Losartán','Tabletas','50 mg');
/*!40000 ALTER TABLE `medicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medico`
--

DROP TABLE IF EXISTS `medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medico` (
  `id_medico` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_especialidad` int DEFAULT NULL,
  PRIMARY KEY (`id_medico`),
  UNIQUE KEY `uq_medico_usuario` (`id_usuario`),
  KEY `fk_medico_especialidad` (`id_especialidad`),
  CONSTRAINT `fk_medico_especialidad` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidad` (`id_especialidad`),
  CONSTRAINT `fk_medico_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medico`
--

LOCK TABLES `medico` WRITE;
/*!40000 ALTER TABLE `medico` DISABLE KEYS */;
INSERT INTO `medico` VALUES ('MED-0001','USR-0001','Julio','Quispe','999111222','Av. Saenz Peña 123, Callao','1980-05-15','M',1),('MED-0002','USR-0002','María','Flores','999222333','Jr. Colina 456, Callao','1985-08-22','F',2),('MED-0003','USR-0003','Alberto','García','999333444','Av. La Marina 789, San Miguel','1975-11-03','M',3),('MED-0004','USR-0004','Lucía','Castillo','999444555','Calle Lima 101, Callao','1990-02-18','F',4),('MED-0005',NULL,'Carlos','Rojas','999555620',NULL,'1982-07-09','M',5),('MED-0006','USR-0007','Rosa','Vargas','944555666',NULL,'1980-11-19','F',7);
/*!40000 ALTER TABLE `medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paciente`
--

DROP TABLE IF EXISTS `paciente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paciente` (
  `id_paciente` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellido` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `uq_paciente_usuario` (`id_usuario`),
  CONSTRAINT `fk_paciente_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paciente`
--

LOCK TABLES `paciente` WRITE;
/*!40000 ALTER TABLE `paciente` DISABLE KEYS */;
INSERT INTO `paciente` VALUES ('PAC-0001','USR-0009','71234567','Luis','Gómez','911222333','Jr. Sucre 202, Callao','1995-10-12','M'),('PAC-0002','USR-0006','72345678','Carmen','Torres','922333444','Av. Pacífico 303, La Perla','1998-03-25','F'),('PAC-0003','USR-0010','73456789','Diego','Morales','933444555','Urb. San José, Bellavista','2005-07-08','M'),('PAC-0004','USR-0007','74567890','Rosa','Vargas','944555666','Jr. Zepita 404, Callao','1980-11-19','F'),('PAC-0005','USR-0008','75678901','Jorge','Castro','955666777','Av. Morales Duarez 505','1970-01-30','M'),('PAC-0006','USR-0011','77572485','Diana Lopez','Huallpa','983374750',NULL,'2002-04-06','F');
/*!40000 ALTER TABLE `paciente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta`
--

DROP TABLE IF EXISTS `receta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receta` (
  `id_receta` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_atencion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_emision` datetime DEFAULT NULL,
  `observaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_receta`),
  KEY `fk_receta_atencion` (`id_atencion`),
  CONSTRAINT `fk_receta_atencion` FOREIGN KEY (`id_atencion`) REFERENCES `atencion` (`id_atencion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta`
--

LOCK TABLES `receta` WRITE;
/*!40000 ALTER TABLE `receta` DISABLE KEYS */;
INSERT INTO `receta` VALUES ('REC-0001','ATE-0001','2026-06-19 10:25:00','Evitar ingesta de mariscos por 30 días','VIGENTE'),('REC-0002','ATE-0002','2026-06-18 07:55:00','Aplicar hielo local, reposo relativo','VIGENTE'),('REC-0003','ATE-0003','2026-06-17 09:25:00','Ingerir abundantes líquidos','SURTIDA'),('REC-0004','ATE-0004','2026-07-05 06:02:01','gggggg','EMITIDA'),('REC-0005','ATE-0005','2026-07-05 07:37:58','gggggg','EMITIDA');
/*!40000 ALTER TABLE `receta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `receta_medicamento`
--

DROP TABLE IF EXISTS `receta_medicamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `receta_medicamento` (
  `id_receta_medicamento` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_receta` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_medicamento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosis` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `indicaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_receta_medicamento`),
  KEY `fk_rm_receta` (`id_receta`),
  KEY `fk_rm_medicamento` (`id_medicamento`),
  CONSTRAINT `fk_rm_medicamento` FOREIGN KEY (`id_medicamento`) REFERENCES `medicamento` (`id_medicamento`),
  CONSTRAINT `fk_rm_receta` FOREIGN KEY (`id_receta`) REFERENCES `receta` (`id_receta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `receta_medicamento`
--

LOCK TABLES `receta_medicamento` WRITE;
/*!40000 ALTER TABLE `receta_medicamento` DISABLE KEYS */;
INSERT INTO `receta_medicamento` VALUES ('RM-0001','REC-0005','FAR-0001','2','cada 8 horas','7 dias','gggggg'),('RM-0002','REC-0005','FAR-0003','1','8 hours','7 dias','gggggg'),('RMD-0001','REC-0001','FAR-0004','1 Tableta','Cada 24 horas','Por 5 días','Tomar por las noches'),('RMD-0002','REC-0002','FAR-0002','1 Tableta','Cada 8 horas','Por 3 días','Tomar junto con los alimentos'),('RMD-0003','REC-0002','FAR-0006','1 Ampolla','Única dosis','1 día','Aplicación intramuscular en tópico'),('RMD-0004','REC-0003','FAR-0001','1 Tableta','Cada 8 horas','Condicional a fiebre','No exceder 3 días'),('RMD-0005','REC-0003','FAR-0003','1 Cápsula','Cada 8 horas','Por 7 días','Completar todo el tratamiento');
/*!40000 ALTER TABLE `receta_medicamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'ADMINISTRADOR'),(2,'MEDICO'),(3,'PACIENTE');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `id_rol` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES ('USR-0000','admin_123','admin@posta.pe','hash123','ACTIVO','2026-06-18 08:00:00',1),('USR-0001','jquispe','jquispe@posta.pe','hash123','ACTIVO','2026-06-18 08:00:00',2),('USR-0002','mflores','mflores@posta.pe','hash123','ACTIVO','2026-06-18 08:00:00',2),('USR-0003','agarcia','agarcia@posta.pe','hash123','ACTIVO','2026-06-18 08:00:00',3),('USR-0004','lcastillo','lcastillo@posta.pe','hash123','ACTIVO','2026-06-18 08:00:00',2),('USR-0005','crojas','crojas@posta.pe','hash123','ACTIVO','2026-06-18 08:00:00',2),('USR-0006','carmen_t','carmen.t@gmail.com','hash123','ACTIVO','2026-06-18 09:00:00',3),('USR-0007','rosa_v','rosa.v@gmail.com','hash123','ACTIVO','2026-06-18 09:00:00',3),('USR-0008','jorge_c','jorge.c@gmail.com','hash123','ACTIVO','2026-06-18 09:00:00',3),('USR-0009','Luis_G','luis_gomez@outlook.com','hash123','ACTIVO','2026-06-18 09:00:00',3),('USR-0010','diego_m','diegomor@gmail.com','hash123','ACTIVO','2026-06-18 09:00:00',3),('USR-0011','dhuallpa','huallpadianapilar@gmail.com','hash123','ACTIVO','2026-07-04 20:40:30',3),('USR-0012','Pilar','u24256344@utp.edu','hash123','ACTIVO','2026-07-05 15:29:50',3);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-05 21:57:32
