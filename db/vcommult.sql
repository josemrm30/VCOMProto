-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-06-2021 a las 12:50:59
-- Versión del servidor: 10.4.17-MariaDB
-- Versión de PHP: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vcommult`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chat`
--

CREATE TABLE `chat` (
  `id` int(11) NOT NULL,
  `creation_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `chat`
--

INSERT INTO `chat` (`id`, `creation_date`) VALUES
(1, '2021-05-27 01:26:29'),
(2, '2021-05-27 10:22:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chat_entry`
--

CREATE TABLE `chat_entry` (
  `id` int(11) NOT NULL,
  `chat` int(11) NOT NULL,
  `user` varchar(80) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `chat_entry`
--

INSERT INTO `chat_entry` (`id`, `chat`, `user`, `content`) VALUES
(1, 1, 'manuelgm', 'Test message'),
(2, 1, 'josemanu3005', 'second test message');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chat_user`
--

CREATE TABLE `chat_user` (
  `id` int(11) NOT NULL,
  `user` varchar(80) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `chat` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `chat_user`
--

INSERT INTO `chat_user` (`id`, `user`, `chat`) VALUES
(1, 'josemanu3005', 1),
(2, 'manuelgm', 1),
(3, 'manuelgm', 2),
(4, 'usertest', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `friend`
--

CREATE TABLE `friend` (
  `id` int(11) NOT NULL,
  `user1` varchar(80) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `user2` varchar(80) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `since` int(11) NOT NULL,
  `accepted` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `friend`
--

INSERT INTO `friend` (`id`, `user1`, `user2`, `since`, `accepted`) VALUES
(1, 'josemanu3005', 'manuelgm', 0, 1),
(2, 'manuelgm', 'usertest', 0, 1),
(3, 'manuelgm', 'usertest2', 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `name` varchar(80) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `passwdCr` varchar(80) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(80) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `user`
--

INSERT INTO `user` (`name`, `passwdCr`, `email`) VALUES
('josemanu3005', '$2y$10$gBYsmiBwJKj6JE62.4Z9d.hLJ.La.IWSYiQ1KJkwxtpMDNRnPmy.G', 'jmrm0038@red.ujaen.es'),
('manuelgm', '$2y$10$gBYsmiBwJKj6JE62.4Z9d.hLJ.La.IWSYiQ1KJkwxtpMDNRnPmy.G', 'mgm00193@red.ujaen.es'),
('probandouser', '$2a$10$zHeqjuz4ffymTwvZTBfIPekupK3ne0Rn/w2WFkv0mFByV3E3eDhOe', ''),
('probandouser76ds', '$2a$10$vzPQU5yOSq7Qb1HHltIHh.hSCuzpOuwcxKZGHMUxVimNl31n.M3jC', 'dsdsds@fsfs.es'),
('usertest', '$2y$10$gBYsmiBwJKj6JE62.4Z9d.hLJ.La.IWSYiQ1KJkwxtpMDNRnPmy.G', 'test@test.com'),
('usertest2', '$2y$10$gBYsmiBwJKj6JE62.4Z9d.hLJ.La.IWSYiQ1KJkwxtpMDNRnPmy.G', 'test2@test.com');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `chat`
--
ALTER TABLE `chat`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `chat_entry`
--
ALTER TABLE `chat_entry`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_chat_chat_entry` (`chat`),
  ADD KEY `fk_user_chat_entry` (`user`);

--
-- Indices de la tabla `chat_user`
--
ALTER TABLE `chat_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_members` (`user`,`chat`) USING BTREE,
  ADD KEY `fk_chat_user_chatid` (`chat`);

--
-- Indices de la tabla `friend`
--
ALTER TABLE `friend`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_friend_1` (`user1`),
  ADD KEY `fk_user_friend_2` (`user2`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`name`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `chat`
--
ALTER TABLE `chat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `chat_entry`
--
ALTER TABLE `chat_entry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `chat_user`
--
ALTER TABLE `chat_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `friend`
--
ALTER TABLE `friend`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `chat_entry`
--
ALTER TABLE `chat_entry`
  ADD CONSTRAINT `fk_chat_chat_entry` FOREIGN KEY (`chat`) REFERENCES `chat` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_chat_entry` FOREIGN KEY (`user`) REFERENCES `user` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `chat_user`
--
ALTER TABLE `chat_user`
  ADD CONSTRAINT `fk_chat_user_chatid` FOREIGN KEY (`chat`) REFERENCES `chat` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_chat_user_userid` FOREIGN KEY (`user`) REFERENCES `user` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `friend`
--
ALTER TABLE `friend`
  ADD CONSTRAINT `fk_user_friend_1` FOREIGN KEY (`user1`) REFERENCES `user` (`name`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_user_friend_2` FOREIGN KEY (`user2`) REFERENCES `user` (`name`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
