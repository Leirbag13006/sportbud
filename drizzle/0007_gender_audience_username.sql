ALTER TABLE `activities` ADD `audience` text DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `username` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `gender` text;--> statement-breakpoint
-- Comptes existants : pseudo provisoire unique (« membre » + 8 caractères de l'identifiant), modifiable dans le profil.
UPDATE `users` SET `username` = 'membre' || substr(replace(`id`, '-', ''), 1, 8) WHERE `username` = '';--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (lower("username"));